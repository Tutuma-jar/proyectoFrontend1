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

async function renderGrades(evaluations, finalGrade) {
  const enrollment = {
    _id: "enrollment", status: "activa", finalGrade,
    period: { code: "2026-2" }, group: { _id: "group", number: 1 },
    subject: { code: "MAT", name: "Matematicas" },
  };
  const plan = evaluations.map(({ weight }, index) => ({ _id: `ev-${index}`, name: `Exam ${index}`, weight, group: "group" }));
  const grades = evaluations.flatMap(({ value }, index) => value === undefined ? [] : [{
    value, evaluation: plan[index], enrollment: { _id: enrollment._id },
  }]);
  const apiGet = async (path) => {
    if (path === "/enrollments/mine?limit=100") return { data: [enrollment] };
    if (path === "/grades/mine?limit=100") return { data: grades };
    if (path === "/evaluations?group=group&limit=100") return { data: plan };
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

for (const { name, evaluations, expected, evaluated } of [
  { name: "different weights", evaluations: [{ value: 5, weight: 20 }, { value: 1, weight: 80 }], expected: "1.80", evaluated: 100 },
  { name: "equal weights", evaluations: [{ value: 4, weight: 50 }, { value: 2, weight: 50 }], expected: "3.00", evaluated: 100 },
  { name: "zero grade", evaluations: [{ value: 0, weight: 20 }, { value: 5, weight: 80 }], expected: "4.00", evaluated: 100 },
  { name: "pending evaluation contributes no points", evaluations: [{ value: 5, weight: 20 }, { weight: 80 }], expected: "1.00", evaluated: 20 },
  { name: "all grades pending", evaluations: [{ weight: 20 }, { weight: 80 }], expected: "—", evaluated: 0 },
  { name: "only a zero grade recorded", evaluations: [{ value: 0, weight: 20 }, { weight: 80 }], expected: "0.00", evaluated: 20 },
]) {
  test(`FE-012: ${name}`, async () => {
    const html = await renderGrades(evaluations);
    assert.ok(html.includes(`Acumulado (${evaluated}% evaluado)`), html);
    assert.ok(html.includes(`<span class="text-xl font-extrabold">${expected}</span>`), html);
    if (evaluations.some((ev) => ev.value === undefined)) assert.ok(html.includes("Pendiente"));
  });
}

test("FE-012: published final grade remains authoritative", async () => {
  const html = await renderGrades([{ value: 5, weight: 20 }, { value: 1, weight: 80 }], 4.5);
  assert.ok(html.includes("Nota final"));
  assert.ok(html.includes(">4.5</span>"));
  assert.ok(!html.includes("Acumulado"));
});
