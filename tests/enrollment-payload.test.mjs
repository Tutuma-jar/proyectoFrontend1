import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const groupId = "507f1f77bcf86cd799439011";
const studentId = "507f191e810c19729de860ea";

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
const apiFunction = apiSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "api");

function mockApi(requests) {
  return evaluate(apiFunction.getText(apiSource), {
    fetch: async (url, options) => {
      requests.push({ url, method: options.method, body: JSON.parse(options.body) });
      return { ok: true, status: 201, json: async () => ({}) };
    },
  }).api;
}

test("FE-021: student enrollment posts only the complete groupId", async () => {
  const source = readSource("src/app/(app)/estudiante/matricula/enroll-view.tsx");
  const view = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "EnrollView");
  const enroll = view.body.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "enroll");
  const requests = [];
  let reloads = 0;
  let notice;
  const { run } = evaluate(`${enroll.getText(source)}\nexports.run = enroll;`, {
    api: mockApi(requests),
    setBusy: () => {},
    setNotice: (value) => { notice = value; },
    load: async () => { reloads += 1; },
  });

  await run({ group: groupId, subject: { name: "Test" }, number: 1 });

  assert.deepEqual(requests, [{ url: "/api/enrollments", method: "POST", body: { groupId } }]);
  assert.equal(notice.tone, "success");
  assert.equal(reloads, 1);
});

test("FE-021: admin enrollment maps local group to groupId and keeps student", async () => {
  const source = readSource("src/components/admin/operations.tsx");
  const declarations = source.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]);
  const text = declarations.find((node) => node.name.getText(source) === "text");
  const enrollments = declarations.find((node) => node.name.getText(source) === "enrollments");
  const toBody = enrollments.initializer.properties.find((node) => node.name?.getText(source) === "toBody");
  const endpoint = enrollments.initializer.properties.find((node) => node.name?.getText(source) === "endpoint");
  const { makeBody, path } = evaluate(
    `const ${text.getText(source)};\nexports.makeBody = ${toBody.initializer.getText(source)};\nexports.path = ${endpoint.initializer.getText(source)};`,
  );
  const requests = [];

  await mockApi(requests)(path, { method: "POST", body: makeBody({ student: studentId, group: groupId }) });

  assert.deepEqual(requests, [{ url: "/api/enrollments", method: "POST", body: { student: studentId, groupId } }]);
});
