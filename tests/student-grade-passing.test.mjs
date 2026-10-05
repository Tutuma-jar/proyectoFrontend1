import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function loadModule(path, dependencies = require) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  runInNewContext(outputText, { exports, require: dependencies });
  return exports;
}

const format = loadModule("src/lib/format.ts");
const Container = ({ children }) => React.createElement("div", null, children);

async function renderGrade(value) {
  const evaluation = { _id: "exam", name: "Exam", weight: 100, group: "group" };
  const enrollment = {
    _id: "enrollment", status: "activa", finalGrade: value,
    period: { code: "2026-2" }, group: { _id: "group", number: 1 },
    subject: { code: "MAT", name: "Matematicas" },
  };
  const apiGet = async (path) => {
    if (path === "/enrollments/mine?limit=100") return { data: [enrollment] };
    if (path === "/grades/mine?limit=100") return { data: value === undefined ? [] : [{ value, evaluation, enrollment: { _id: enrollment._id } }] };
    if (path === "/evaluations?group=group&limit=100") return { data: [evaluation] };
    throw new Error(`Unexpected API request: ${path}`);
  };
  const dependencies = {
    "@/lib/server": { apiGet },
    "@/lib/format": format,
    "@/lib/cn": { cn: (...classes) => classes.filter(Boolean).join(" ") },
    "@/components/ui/badge": { Badge: Container },
    "@/components/ui/card": { Card: Container },
    "@/components/ui/feedback": { EmptyState: Container, PageHeader: Container },
  };
  const { default: GradesPage } = loadModule("src/app/(app)/estudiante/notas/page.tsx", (name) => dependencies[name] ?? require(name));
  return renderToStaticMarkup(await GradesPage());
}

for (const { value, tone } of [
  { value: 0, tone: "text-danger-600" },
  { value: 2.99, tone: "text-danger-600" },
  { value: 3, tone: "text-success-600" },
  { value: 3.01, tone: "text-success-600" },
]) {
  test(`FE-013: partial and final grade ${value} use ${tone}`, async () => {
    const html = await renderGrade(value);
    const formatted = format.grade(value);
    assert.ok(html.includes(`<td class="py-2.5 text-right font-bold ${tone}">${formatted}</td>`), "Incorrect partial grade tone");
    assert.ok(html.includes(`<span class="text-2xl font-extrabold ${tone}">${formatted}</span>`), "Incorrect final grade tone");
  });
}

test("FE-013: pending grades keep their neutral style", async () => {
  const html = await renderGrade(undefined);
  assert.ok(html.includes('<td class="py-2.5 text-right font-bold text-muted">Pendiente</td>'));
  assert.ok(!html.includes("Nota final"));
});
