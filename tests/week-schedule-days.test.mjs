import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function load(filename, mocks = {}) {
  const source = readFileSync(new URL(`../${filename}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  });
  return exports;
}

const format = load("src/lib/format.ts");
const Card = ({ children }) => createElement("section", null, children);
const { WeekSchedule } = load("src/components/week-schedule.tsx", {
  "@/components/ui/card": { Card },
  "@/lib/cn": { cn: (...values) => values.filter(Boolean).join(" ") },
  "@/lib/format": format,
});

function slot(day) {
  return { day, startTime: "08:00", endTime: "10:00", group: day, subject: { code: day, name: `Class-${day}` } };
}

const friday = slot("viernes");
const saturday = slot("sabado");

function checkCards(html, { fridayPresent = true } = {}) {
  const sections = [...html.matchAll(/<section>([\s\S]*?)<\/section>/g)].map((match) => match[1]);
  assert.equal(sections.length, 6);
  const fridayCard = sections.find((section) => section.includes(">Viernes</h2>"));
  const saturdayCard = sections.find((section) => section.includes(">Sábado</h2>"));
  assert.ok(fridayCard);
  assert.ok(saturdayCard);
  assert.doesNotMatch(fridayCard, /Class-sabado/);
  assert.match(saturdayCard, /Class-sabado/);
  assert.doesNotMatch(saturdayCard, /Class-viernes|Sin clases/);
  if (fridayPresent) {
    assert.match(fridayCard, /Class-viernes/);
    assert.doesNotMatch(fridayCard, /Sin clases/);
    assert.equal((html.match(/Class-viernes/g) ?? []).length, 1);
  } else {
    assert.match(fridayCard, /Sin clases/);
    assert.doesNotMatch(html, /Class-viernes/);
  }
  assert.equal((html.match(/Class-sabado/g) ?? []).length, 1);
}

test("FE-011: Friday and Saturday classes stay in separate cards", () => {
  const html = renderToStaticMarkup(createElement(WeekSchedule, { byDay: { viernes: [friday], sabado: [saturday] } }));
  checkCards(html);
});

test("FE-011: a Saturday-only schedule leaves Friday empty", () => {
  const html = renderToStaticMarkup(createElement(WeekSchedule, { byDay: { sabado: [saturday] } }));
  checkCards(html, { fridayPresent: false });
});

for (const role of ["estudiante", "docente"]) {
  test(`FE-011: ${role} schedule renders Friday and Saturday from its API response`, async () => {
    const requests = [];
    const { default: Page } = load(`src/app/(app)/${role}/horario/page.tsx`, {
      "@/components/ui/badge": { Badge: ({ children }) => children },
      "@/components/ui/feedback": { PageHeader: () => null, EmptyState: () => null },
      "@/components/week-schedule": { WeekSchedule },
      "@/lib/format": format,
      "@/lib/server": {
        apiGetOrNull: async (path) => {
          requests.push(path);
          return { period: { code: "2026-2" }, subjects: 2, credits: 6, groups: 2, students: 10, slots: [friday, saturday], byDay: { viernes: [friday], sabado: [saturday] } };
        },
      },
    });

    checkCards(renderToStaticMarkup(await Page()));
    assert.deepEqual(requests, [role === "estudiante" ? "/students/me/schedule" : "/teachers/me/schedule"]);
  });
}
