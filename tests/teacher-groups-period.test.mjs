import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function load(path, mocks = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
    fileName: path,
  });
  const exports = {};
  runInNewContext(outputText, { exports, require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) });
  return exports;
}

const format = load("src/lib/format.ts");
const { PeriodSelect } = load("src/app/(app)/docente/grupos/period-select.tsx", {
  "next/navigation": { useRouter: () => ({ push() {} }) },
});
const current = { _id: "507f1f77bcf86cd799439011", code: "2026-2", status: "abierto" };
const historical = { _id: "507f1f77bcf86cd799439012", code: "2026-1", status: "cerrado" };
const groups = [current, historical].map((period, i) => ({
  _id: `group-${i}`, period, number: 1, active: true, enrolled: 8, capacity: 30, schedule: [],
  subject: { code: `MAT-${i}`, name: i === 0 ? "CurrentCourse" : "HistoricalCourse" },
}));

async function renderGroups(searchParams, openPeriod = current) {
  const requests = [];
  const apiGet = async (path) => {
    requests.push(path);
    if (path === "/periods?limit=100") return { data: [current, historical] };
    const url = new URL(path, "http://test");
    assert.equal(url.pathname, "/groups/mine");
    assert.equal(url.searchParams.get("limit"), "100");
    const period = url.searchParams.get("period");
    return { data: groups.filter((group) => !period || group.period._id === period) };
  };
  const { default: MyGroupsPage } = load("src/app/(app)/docente/grupos/page.tsx", {
    "@/lib/server": { apiGet, apiGetOrNull: async (path) => {
      requests.push(path);
      assert.equal(path, "/periods/current");
      return openPeriod;
    } },
    "@/lib/format": format,
    "@/lib/cn": { cn: (...values) => values.filter(Boolean).join(" ") },
    "next/link": { default: ({ href, children }) => createElement("a", { href }, children) },
    "@/components/ui/badge": { Badge: ({ children }) => createElement("span", null, children) },
    "@/components/ui/card": { Card: ({ children }) => createElement("section", null, children) },
    "@/components/ui/feedback": { PageHeader: ({ action }) => createElement("header", null, action), EmptyState: () => null },
    "./period-select": { PeriodSelect },
  });
  const html = renderToStaticMarkup(await MyGroupsPage({ searchParams: Promise.resolve(searchParams) }));
  const path = requests.find((request) => request.startsWith("/groups/mine"));
  assert.ok(path);
  assert.equal(requests.filter((request) => request.startsWith("/groups/mine")).length, 1);
  return { html, params: new URL(path, "http://test").searchParams };
}

for (const { name, query, openPeriod, selected, filtered } of [
  { name: "default open period", query: {}, openPeriod: current, selected: current._id, filtered: current._id },
  { name: "explicit all periods", query: { period: "todos" }, openPeriod: current, selected: "todos", filtered: null },
  { name: "explicit historical period", query: { period: historical._id }, openPeriod: current, selected: historical._id, filtered: historical._id },
  { name: "no open period", query: {}, openPeriod: null, selected: "todos", filtered: null },
  { name: "empty selection", query: { period: "" }, openPeriod: current, selected: "todos", filtered: null },
  { name: "array query uses default", query: { period: [historical._id, current._id] }, openPeriod: current, selected: current._id, filtered: current._id },
]) {
  test(`FE-024: query and selector agree for ${name}`, async () => {
    const { html, params } = await renderGroups(query, openPeriod);
    assert.equal(params.get("period"), filtered);
    assert.ok(html.includes(`<option value="${selected}" selected="">`), "Incorrect selected period");
    assert.equal(html.includes("CurrentCourse"), filtered === null || filtered === current._id);
    assert.equal(html.includes("HistoricalCourse"), filtered === null || filtered === historical._id);
  });
}
