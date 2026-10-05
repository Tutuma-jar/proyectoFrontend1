import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const filename = "src/app/(app)/docente/grupos/[id]/evaluations-panel.tsx";
const source = readFileSync(new URL(`../${filename}`, import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
  fileName: filename,
});
const childrenOnly = ({ children }) => children;

function renderPlan(weights, readOnly) {
  let stateIndex = 0;
  const items = weights.map((weight, index) => ({ _id: `evaluation-${index}`, name: `Evaluation ${index}`, weight }));
  const mocks = {
    react: {
      ...require("react"),
      useState: (initial) => [stateIndex++ === 0 ? items : initial, () => { throw new Error("Unexpected state update during rendering"); }],
      useCallback: (callback) => callback,
      useEffect: () => {},
    },
    "@/lib/api": { api: () => { throw new Error("No real API requests allowed"); } },
    "@/lib/cn": { cn: (...values) => values.filter(Boolean).join(" ") },
    "@/components/ui/button": { Button: childrenOnly },
    "@/components/ui/card": { Card: childrenOnly },
    "@/components/ui/field": { Field: () => null },
    "@/components/ui/feedback": { Alert: childrenOnly, EmptyState: () => null },
  };
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  });
  return renderToStaticMarkup(createElement(exports.EvaluationsPanel, { groupId: "test-group", readOnly }));
}

const cases = [
  { weights: [], total: 0, expected: "Faltan 100% para completar el plan." },
  { weights: [20, 40], total: 60, expected: "Faltan 40% para completar el plan." },
  { weights: [40, 60], total: 100, expected: "El plan está completo." },
  { weights: [60, 60], total: 120, expected: "Te pasaste 20%." },
];

for (const readOnly of [false, true]) {
  for (const { weights, total, expected } of cases) {
    test(`FE-007: total ${total}% displays the correct message (readOnly=${readOnly})`, () => {
      const html = renderPlan(weights, readOnly);
      const indicator = html.match(/<aside[^>]*>([\s\S]*?)<\/aside>/)?.[1];
      assert.ok(indicator, "The evaluation plan must show its summary");
      assert.ok(indicator.includes(expected), `Expected: ${expected}`);
      assert.match(indicator, new RegExp(`aria-valuenow="${total}"`));
      if (total < 100) assert.doesNotMatch(indicator, /Te pasaste|El plan está completo/);
      if (total > 100) assert.doesNotMatch(indicator, /Faltan|El plan está completo/);
      if (total === 100) assert.doesNotMatch(indicator, /Faltan|Te pasaste/);
    });
  }
}
