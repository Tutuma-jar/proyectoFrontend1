import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX };

function loadModule(path, dependencies = require) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions });
  const exports = {};
  runInNewContext(outputText, { exports, require: dependencies });
  return exports;
}

const format = loadModule("src/lib/format.ts");
const { Badge } = loadModule("src/components/ui/badge.tsx", (name) => name === "@/lib/cn"
  ? { cn: (...classes) => classes.filter(Boolean).join(" ") }
  : require(name));
const expected = [
  { status: "activa", label: "En curso", tone: "primary", color: "text-primary-800" },
  { status: "aprobada", label: "Aprobada", tone: "success", color: "text-success-600" },
  { status: "reprobada", label: "Reprobada", tone: "danger", color: "text-danger-600" },
  { status: "cancelada", label: "Cancelada", tone: "neutral", color: "text-muted" },
];

test("FE-014: the shared map preserves distinct labels and existing tones", () => {
  for (const { status, label, tone } of expected) {
    assert.equal(format.STATUS_LABEL[status], label, status);
    assert.equal(format.STATUS_TONE[status], tone, status);
  }
});

for (const { name, path } of [
  { name: "student history", path: "src/app/(app)/estudiante/historial/page.tsx" },
  { name: "teacher grade sheet", path: "src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx" },
]) {
  test(`FE-014: ${name} renders the shared status label and tone`, () => {
    const text = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const badges = [];
    function visit(node) {
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === "Badge"
        && node.getText(source).includes("STATUS_LABEL[")) badges.push(node);
      ts.forEachChild(node, visit);
    }
    visit(source);
    assert.equal(badges.length, 1, "Expected exactly one shared status badge");
    // Render the real consumer's badge JSX in isolation, without hooks or API calls.
    const { outputText } = ts.transpileModule(`exports.render = (row, c) => (${badges[0].getText(source)});`, {
      compilerOptions, fileName: "status-badge.tsx",
    });
    const exports = {};
    runInNewContext(outputText, { exports, require, Badge, STATUS_LABEL: format.STATUS_LABEL, STATUS_TONE: format.STATUS_TONE });
    for (const { status, label, color } of expected) {
      const html = renderToStaticMarkup(exports.render({ status }, { status }));
      assert.ok(html.includes(`>${label}</span>`), `${status}: ${html}`);
      assert.ok(html.includes(color), `${status}: ${html}`);
    }
  });
}
