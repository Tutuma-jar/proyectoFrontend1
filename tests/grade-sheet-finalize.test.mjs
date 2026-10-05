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
const panel = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "GradeSheetPanel");
const finalize = panel.body.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "finalize");
let confirm;
function findConfirm(node) {
  if (ts.isJsxOpeningElement(node) && node.attributes.properties.some((attribute) =>
    ts.isJsxAttribute(attribute) && attribute.name.text === "onClick" && attribute.initializer?.getText(source) === "{finalize}")) confirm = node;
  ts.forEachChild(node, findConfirm);
}
findConfirm(panel);
const disabled = confirm.attributes.properties.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === "disabled");
const { outputText } = ts.transpileModule(`${finalize.getText(source)}
exports.finalize = finalize;
exports.disabled = () => ${disabled?.initializer.expression.getText(source) ?? "false"};`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
});

function scenario(overrides = {}) {
  const calls = [];
  const context = {
    exports: {}, groupId: "test-group", changes: [], unsaved: false,
    ready: 1, sheet: { summary: { readyToFinalize: 1, planComplete: true } },
    readOnly: false, saving: false, finalizing: false,
    setFinalizing: (value) => { context.finalizing = value; },
    setConfirming: (value) => { context.confirming = value; },
    setNotice: () => {}, setResult: (value) => { context.result = value; },
    load: async () => {}, message: (error) => error.message,
    api: async (path, options) => { calls.push({ path, options }); return { finalized: 1 }; },
    ...overrides,
  };
  runInNewContext(outputText, context);
  return { ...context.exports, calls, context };
}

for (const value of [2, null]) {
  test(`FE-018: pending ${value === null ? "invalid" : "valid"} edits block the confirmation and handler`, async () => {
    const view = scenario({ changes: [{ value }], unsaved: true });
    assert.equal(view.disabled(), true);
    await view.finalize();
    assert.equal(view.calls.length, 0);
    assert.equal(view.context.finalizing, false);
  });
}

for (const [name, overrides] of [
  ["incomplete plan", { sheet: { summary: { readyToFinalize: 1, planComplete: false } } }],
  ["no ready students", { ready: 0, sheet: { summary: { readyToFinalize: 0, planComplete: true } } }],
  ["save in progress", { saving: true }],
]) {
  test(`FE-018: ${name} blocks confirmation and the handler`, async () => {
    const view = scenario(overrides);
    assert.equal(view.disabled(), true);
    await view.finalize();
    assert.equal(view.calls.length, 0);
  });
}

for (const overrides of [{ readOnly: true }, { finalizing: true }, { sheet: null }]) {
  test(`FE-018: handler rejects unavailable or busy state ${JSON.stringify(overrides)}`, async () => {
    const view = scenario(overrides);
    await view.finalize();
    assert.equal(view.calls.length, 0);
  });
}

test("FE-018: a valid confirmation sends one POST and closes the confirmation", async () => {
  const view = scenario();
  assert.equal(view.disabled(), false);
  await view.finalize();
  assert.equal(view.calls.length, 1);
  assert.equal(view.calls[0].path, "/groups/test-group/finalize");
  assert.equal(view.calls[0].options.method, "POST");
  assert.equal(view.context.confirming, false);
  assert.equal(view.context.finalizing, false);
  assert.equal(view.context.result.finalized, 1);
});
