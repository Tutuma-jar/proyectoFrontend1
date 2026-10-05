import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function source(filename) {
  return ts.createSourceFile(filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
function declaration(body, name) {
  return body.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations])
    .find((node) => node.name.getText() === name);
}
const manager = source("src/components/admin/resource-manager.tsx");
const form = manager.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "RecordForm");
const set = declaration(form.body, "set");
const optionsEffect = form.body.statements.filter((node) => ts.isExpressionStatement(node)
  && ts.isCallExpression(node.expression) && node.expression.expression.getText(manager) === "useEffect")[1];
const configs = source("src/components/admin/configs.tsx");
const subjects = declaration(configs, "subjects");
const property = (name) => subjects.initializer.properties.find((node) => node.name?.getText(configs) === name).initializer.getText(configs);
const { outputText } = ts.transpileModule([
  `exports.fields = ${property("fields")};`,
  `exports.initial = ${property("initial")};`,
  `exports.toBody = ${property("toBody")};`,
  `exports.set = ${set.initializer.getText(manager)};`,
  `exports.loadOptions = ${optionsEffect.expression.arguments[0].getText(manager)};`,
].join("\n"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
});

function setup() {
  const context = {
    exports: {}, values: undefined, fields: undefined, dynamic: {},
    row: { _id: "subject-current", code: "TEST", name: "Materia", credits: 3, program: "A", prerequisites: ["subject-A"] },
    id: (value) => typeof value === "string" ? value : value?._id ?? "",
    text: (value) => String(value ?? "").trim(),
    optional: (value) => value ? String(value).trim() : undefined,
    setValues: (update) => { context.values = typeof update === "function" ? update(context.values) : update; },
    setDynamic: (update) => { context.dynamic = update(context.dynamic); },
    api: async (path) => {
      const program = new URL(path, "https://test.invalid").searchParams.get("program");
      return { data: [{ _id: `subject-${program}`, code: program, name: "Prerrequisito" }, { _id: "subject-current", code: "TEST", name: "Materia" }] };
    },
  };
  runInNewContext(outputText, context);
  context.fields = context.exports.fields;
  context.values = context.exports.initial(context.row);
  return context;
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
const prerequisites = (context) => [...context.exports.toBody(context.values, "edit").prerequisites];

test("FE-006: changing program clears hidden prerequisites and old options immediately", async () => {
  const context = setup();
  const cleanup = context.exports.loadOptions();
  await flush();
  context.exports.set("program", "B");
  assert.deepEqual(prerequisites(context), []);
  assert.deepEqual([...context.dynamic.prerequisites], []);
  assert.equal(context.exports.toBody(context.values, "create").program, "B");
  cleanup();
  context.exports.loadOptions();
  await flush();
  assert.deepEqual(context.dynamic.prerequisites.map((option) => option.value), ["subject-B"]);
  context.exports.set("prerequisites", ["subject-B"]);
  assert.deepEqual(prerequisites(context), ["subject-B"]);
});

test("FE-006: initial editing preserves existing valid prerequisites", async () => {
  const context = setup();
  context.exports.loadOptions();
  await flush();
  assert.deepEqual(prerequisites(context), ["subject-A"]);
  assert.deepEqual(context.dynamic.prerequisites.map((option) => option.value), ["subject-A"]);
});

test("FE-006: unrelated edits and selecting the same program preserve prerequisites", () => {
  const context = setup();
  context.exports.set("name", "Otro nombre");
  context.exports.set("program", "A");
  assert.deepEqual(prerequisites(context), ["subject-A"]);
});

test("FE-006: clearing the program also clears prerequisites", () => {
  const context = setup();
  context.exports.set("program", "");
  assert.deepEqual(prerequisites(context), []);
});

test("FE-006: switching back does not restore a hidden selection", () => {
  const context = setup();
  context.exports.set("program", "B");
  context.exports.set("program", "A");
  assert.deepEqual(prerequisites(context), []);
});
