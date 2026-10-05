import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function readSource(filename) {
  return ts.createSourceFile(filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
function declaration(body, name) {
  return body.statements.filter(ts.isVariableStatement)
    .flatMap((node) => [...node.declarationList.declarations])
    .find((node) => node.name.getText() === name);
}
const source = readSource("src/components/admin/resource-manager.tsx");
const recordForm = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "RecordForm");
const manager = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "ResourceManager");
const dirtyEffect = recordForm.body.statements.find((node) => ts.isExpressionStatement(node)
  && ts.isCallExpression(node.expression) && node.expression.expression.getText(source) === "useEffect");
const close = declaration(manager.body, "closeForm");
const configs = readSource("src/components/admin/configs.tsx");
const users = declaration(configs, "users");
const initial = users.initializer.properties.find((node) => node.name?.getText(configs) === "initial");
const { outputText } = ts.transpileModule([
  `exports.initial = ${initial.initializer.getText(configs)};`,
  `exports.updateDirty = ${dirtyEffect.expression.arguments[0].getText(source)};`,
  `exports.close = ${close.initializer.getText(source)};`,
].join("\n"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
});

const user = { _id: "test-user", name: "Ana", email: "ana@example.invalid", role: "docente", active: false, createdAt: "2026-01-01" };
function setup(row = user, mode = "edit") {
  const context = {
    exports: {}, row, values: undefined, dirty: { current: false },
    config: { keepOpenIfDirty: true }, form: { mode, row },
    onDirty: (value) => { context.dirty.current = value; },
    setForm: (value) => { context.form = value; },
  };
  runInNewContext(outputText, context);
  context.config.initial = context.exports.initial;
  context.values = context.config.initial(row);
  return context;
}

test("FE-004: opening an unchanged user allows closing despite API-only fields", () => {
  const context = setup();
  context.exports.updateDirty();
  assert.equal(context.dirty.current, false);
  context.exports.close();
  assert.equal(context.form, null);
});

test("FE-004: a real edit still prevents closing", () => {
  const context = setup();
  context.values = { ...context.values, name: "Otro nombre" };
  context.exports.updateDirty();
  assert.equal(context.dirty.current, true);
  context.exports.close();
  assert.notEqual(context.form, null);
});

for (const [field, changed] of [["name", "Otro nombre"], ["active", true]]) {
  test(`FE-004: restoring ${field} allows closing again`, () => {
    const context = setup();
    const original = context.values[field];
    context.values = { ...context.values, [field]: changed };
    context.exports.updateDirty();
    assert.equal(context.dirty.current, true);
    context.values = { ...context.values, [field]: original };
    context.exports.updateDirty();
    assert.equal(context.dirty.current, false);
    context.exports.close();
    assert.equal(context.form, null);
  });
}

test("FE-004: create mode retains its initial dirty state and closing behavior", () => {
  const context = setup(null, "create");
  context.exports.updateDirty();
  assert.equal(context.dirty.current, false);
  context.values = { ...context.values, name: "Nuevo usuario" };
  context.exports.updateDirty();
  assert.equal(context.dirty.current, true);
  context.exports.close();
  assert.equal(context.form, null);
});
