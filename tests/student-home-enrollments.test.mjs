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

const { StatCard } = load("src/components/stat-card.tsx", {
  "@/components/ui/card": { Card: ({ children }) => createElement("section", null, children) },
});
const current = { _id: "507f1f77bcf86cd799439011", code: "2026-2", startDate: "2026-07-01", endDate: "2026-12-01", status: "abierto" };
const records = [
  ...Array.from({ length: 2 }, () => ({ status: "activa", period: current._id })),
  ...["aprobada", "cancelada", "reprobada"].map((status) => ({ status, period: current._id })),
  ...["activa", "aprobada", "cancelada"].map((status) => ({ status, period: "old-period" })),
];

function fixture({ period = current, enrollments = records, unavailable = false } = {}) {
  const requests = [];
  const apiGet = async (path) => {
    requests.push(path);
    assert.equal(path, "/users/me");
    return { name: "Ana Test" };
  };
  const apiGetOrNull = async (path) => {
    requests.push(path);
    if (path === "/periods/current") return period;
    if (path === "/notifications/mine?limit=1") return { unread: 4 };
    const url = new URL(path, "http://test");
    assert.equal(url.pathname, "/enrollments/mine");
    if (unavailable) return null;
    const status = url.searchParams.get("status");
    const periodId = url.searchParams.get("period");
    const filtered = enrollments.filter((row) => (!status || row.status === status) && (!periodId || row.period === periodId));
    return { data: filtered.slice(0, Number(url.searchParams.get("limit"))), meta: { total: filtered.length } };
  };
  const { default: StudentHome } = load("src/app/(app)/estudiante/page.tsx", {
    "@/lib/server": { apiGet, apiGetOrNull },
    "@/components/stat-card": { StatCard },
    "@/components/ui/feedback": { PageHeader: () => null },
  });
  return { render: async () => renderToStaticMarkup(await StudentHome()), requests };
}

function checkCount(html, value) {
  const card = [...html.matchAll(/<section>([\s\S]*?)<\/section>/g)].find((match) => match[1].includes("Materias matriculadas"));
  assert.ok(card);
  assert.ok(card[1].includes(`class="text-2xl font-extrabold tracking-tight">${value}</p>`), card[1]);
}

function checkFilter(requests) {
  const paths = requests.filter((path) => path.startsWith("/enrollments/mine"));
  assert.equal(paths.length, 1);
  const params = new URL(paths[0], "http://test").searchParams;
  assert.equal(params.get("status"), "activa");
  assert.equal(params.get("period"), current._id);
  assert.equal(params.get("limit"), "1");
  assert.equal(requests.filter((path) => path === "/periods/current").length, 1);
}

test("FE-026: count excludes six historical or non-active enrollments", async () => {
  const home = fixture();
  checkCount(await home.render(), 2);
  checkFilter(home.requests);
});

test("FE-026: no open period shows zero without querying enrollments", async () => {
  const home = fixture({ period: null });
  const html = await home.render();
  checkCount(html, 0);
  assert.ok(html.includes("No hay un periodo abierto"));
  assert.equal(home.requests.some((path) => path.startsWith("/enrollments/mine")), false);
});

test("FE-026: an open period with no active enrollments shows zero", async () => {
  const home = fixture({ enrollments: records.filter((row) => row.status !== "activa" || row.period !== current._id) });
  checkCount(await home.render(), 0);
  checkFilter(home.requests);
});

test("FE-026: enrollment lookup failure preserves the existing zero fallback", async () => {
  const home = fixture({ unavailable: true });
  checkCount(await home.render(), 0);
  checkFilter(home.requests);
});

test("FE-026: enrollment lookup waits for the current period", async () => {
  let resolvePeriod;
  const period = new Promise((resolve) => { resolvePeriod = resolve; });
  const home = fixture({ period });
  const pending = home.render();
  const queriedEarly = home.requests.some((path) => path.startsWith("/enrollments/mine"));
  const independentStarted = home.requests.includes("/users/me") && home.requests.includes("/notifications/mine?limit=1");
  resolvePeriod(current);
  checkCount(await pending, 2);
  assert.equal(queriedEarly, false);
  assert.equal(independentStarted, true);
  checkFilter(home.requests);
});
