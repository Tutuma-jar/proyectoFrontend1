import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const filename = "src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx";
const source = ts.createSourceFile(filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const variable = (statements, name) => statements.find((node) => ts.isVariableStatement(node)
  && node.declarationList.declarations.some((declaration) => declaration.name.getText(source) === name)).getText(source);
const panel = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "GradeSheetPanel");
const save = panel.body.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "save");
const snippets = [variable(source.statements, "key"), variable(source.statements, "parse"),
  variable(panel.body.statements, "changes"), variable(panel.body.statements, "invalid"), save.getText(source),
  "exports.parse = parse; exports.changes = changes; exports.invalid = invalid; exports.save = save;"];
const { outputText } = ts.transpileModule(snippets.join("\n"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
});

function scenario(text = "3,5", saved = 3) {
  let drafts = { "student:exam": text };
  const calls = [];
  const exports = {};
  runInNewContext(outputText, {
    exports, drafts,
    sheet: { evaluations: [{ id: "exam" }], rows: [{ enrollment: "student", grades: { exam: saved } }] },
    useMemo: (calculate) => calculate(),
    setSaving: () => {}, setNotice: () => {}, setResult: () => {},
    setDrafts: (update) => { drafts = update(drafts); },
    load: async () => {}, message: (error) => error.message,
    api: async (path, options) => { calls.push({ path, options }); return { saved: 1, failed: [] }; },
  });
  return { ...exports, calls };
}

test("FE-010: comma and dot decimals have the same numeric value", () => {
  const { parse } = scenario();
  for (const [text, expected] of [["3,5", 3.5], ["3.5", 3.5], ["0,25", 0.25], ["5,00", 5], [" 3,5 ", 3.5]]) {
    assert.equal(parse(text), expected, text);
  }
});

test("FE-010: invalid ranges, precision and multiple separators remain invalid", () => {
  const { parse } = scenario();
  for (const text of ["5,01", "3,555", "3,5,1", "3,5.1", "3.5,1", "1,000", "-1,5", "6", "", " "]) {
    assert.equal(parse(text), null, text);
  }
});

test("FE-010: a comma decimal is a valid pending change and saves a number", async () => {
  const view = scenario();
  assert.equal(view.changes.length, 1);
  assert.equal(view.invalid.length, 0);
  await view.save();
  assert.equal(view.calls.length, 1);
  assert.equal(view.calls[0].path, "/grades/bulk");
  assert.equal(view.calls[0].options.method, "PUT");
  assert.equal(view.calls[0].options.body.items[0].value, 3.5);
  assert.equal(typeof view.calls[0].options.body.items[0].value, "number");
});

test("FE-010: comma text equal to the saved numeric grade is not pending", () => {
  assert.equal(scenario("3,5", 3.5).changes.length, 0);
});
