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
  runInNewContext(outputText, {
    exports, require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  });
  return exports;
}

const format = load("src/lib/format.ts");
const { WeekSchedule } = load("src/components/week-schedule.tsx", {
  "@/lib/format": format,
  "@/lib/cn": { cn: (...classes) => classes.filter(Boolean).join(" ") },
  "@/components/ui/card": { Card: ({ children }) => createElement("section", null, children) },
});
const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const labels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

test("FE-015: shared labels preserve all API day keys", () => {
  assert.deepEqual(Object.keys(format.DAY_LABEL), days);
  assert.deepEqual(Object.values(format.DAY_LABEL), labels);
});

function checkHeaders(html) {
  const headings = [...html.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)].map((match) => match[1]);
  assert.deepEqual(headings, labels);
  assert.ok(!html.includes("Lrrrrunes"));
}

test("FE-015: an empty week displays all six correct headings", () => {
  const byDay = Object.fromEntries(days.map((day) => [day, []]));
  const html = renderToStaticMarkup(createElement(WeekSchedule, { byDay }));
  checkHeaders(html);
  assert.equal((html.match(/Sin clases/g) ?? []).length, 6);
});

test("FE-015: headings remain correct with classes loaded", () => {
  const byDay = Object.fromEntries(days.map((day) => [day, [{
    day, startTime: "08:00", endTime: "10:00", group: 1,
    subject: { code: day, name: `Class-${day}` },
  }]]));
  const html = renderToStaticMarkup(createElement(WeekSchedule, { byDay }));
  checkHeaders(html);
  assert.ok(html.includes("Class-lunes"));
});
