import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const id = "507f1f77bcf86cd799439011";

function readSource(filename) {
  return ts.createSourceFile(
    filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX,
  );
}

function evaluate(code, context = {}) {
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  });
  const exports = {};
  runInNewContext(outputText, { exports, ...context });
  return exports;
}

const apiSource = readSource("src/lib/api.ts");
const apiClass = apiSource.statements.find((node) => ts.isClassDeclaration(node) && node.name?.text === "ApiError");
const apiFunction = apiSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "api");

function mockClient(requests, status) {
  return evaluate(`${apiClass.getText(apiSource)}\n${apiFunction.getText(apiSource)}`, {
    fetch: async (url, options) => {
      requests.push({ url, method: options.method });
      return { ok: status === 200, status, json: async () => ({ message: "Cancellation denied" }) };
    },
  });
}

const studentSource = readSource("src/app/(app)/estudiante/materias/cancel-button.tsx");
const button = studentSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "CancelButton");
const cancel = button.body.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "cancel");
const adminSource = readSource("src/components/admin/operations.tsx");
const confirmAction = adminSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "ConfirmAction");
const confirm = confirmAction.body.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "confirm");
const declarations = adminSource.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]);
const enrollments = declarations.find((node) => node.name.getText(adminSource) === "enrollments");
const rowActions = enrollments.initializer.properties.find((node) => node.name?.getText(adminSource) === "rowActions");
let runExpression;
function findRun(node) {
  if (ts.isJsxAttribute(node) && node.name.text === "run") runExpression = node.initializer.expression;
  ts.forEachChild(node, findRun);
}
findRun(rowActions);
assert.ok(runExpression, "Enrollment cancellation must expose its run handler");

for (const status of [200, 403]) {
  test(`FE-022: student cancellation uses POST and handles ${status}`, async () => {
    const requests = [];
    const client = mockClient(requests, status);
    let confirming = true;
    let loading = false;
    let error;
    const { run } = evaluate(`${cancel.getText(studentSource)}\nexports.run = cancel;`, {
      ...client, id,
      setConfirming: (value) => { confirming = value; },
      setLoading: (value) => { loading = value; },
      setError: (value) => { error = value; },
    });

    await run();

    assert.deepEqual(requests, [{ url: `/api/enrollments/${id}/cancel`, method: "POST" }]);
    assert.equal(loading, false);
    assert.equal(confirming, status !== 200);
    assert.equal(error, status === 200 ? null : "Cancellation denied");
  });

  test(`FE-022: admin cancellation uses POST and handles ${status}`, async () => {
    const requests = [];
    const client = mockClient(requests, status);
    const { run } = evaluate(`exports.run = ${runExpression.getText(adminSource)};`, { ...client, r: { _id: id } });
    let open = true;
    let busy = false;
    let error;
    let reloads = 0;
    const { execute } = evaluate(`${confirm.getText(adminSource)}\nexports.execute = confirm;`, {
      run,
      message: (e, fallback) => e instanceof client.ApiError ? e.message : fallback,
      setOpen: (value) => { open = value; },
      setBusy: (value) => { busy = value; },
      setError: (value) => { error = value; },
      onDone: () => { reloads += 1; },
    });

    await execute();

    assert.deepEqual(requests, [{ url: `/api/enrollments/${id}/cancel`, method: "POST" }]);
    assert.equal(busy, false);
    assert.equal(open, status !== 200);
    assert.equal(error, status === 200 ? null : "Cancellation denied");
    assert.equal(reloads, status === 200 ? 1 : 0);
  });
}
