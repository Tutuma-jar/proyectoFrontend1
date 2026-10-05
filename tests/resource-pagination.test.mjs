import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const filename = "src/components/admin/resource-manager.tsx";
const source = ts.createSourceFile(
  filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX,
);
const manager = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "ResourceManager");
const load = manager.body.statements
  .filter(ts.isVariableStatement)
  .flatMap((node) => [...node.declarationList.declarations])
  .find((node) => node.name.getText(source) === "load");
const { outputText } = ts.transpileModule(`exports.load = ${load.initializer.arguments[0].getText(source)};`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
});

function setup({ filters, query = "", search = { param: "q" } }) {
  const requests = [];
  const responses = [];
  const records = Array.from({ length: 20 }, (_, index) => ({
    _id: String(index), role: index < 17 ? "docente" : "estudiante", active: "false",
  }));
  const context = {
    exports: {}, URLSearchParams, PAGE_SIZE: 15, page: 1, filters, query,
    config: { endpoint: "/users", search },
    api: async (path) => {
      const url = new URL(path, "https://test.invalid");
      requests.push(url.searchParams);
      const role = url.searchParams.get("role");
      const matching = records.filter((row) => !role || row.role === role);
      const page = Number(url.searchParams.get("page"));
      return {
        data: matching.slice((page - 1) * 15, page * 15),
        meta: { page, total: matching.length, totalPages: Math.ceil(matching.length / 15) },
      };
    },
    setData: (data) => responses.push(data),
    setError: (error) => { assert.equal(error, null); },
    message: (error) => error.message,
  };
  runInNewContext(outputText, context);
  return { context, requests, responses };
}

test("FE-003: next and previous pages preserve filters and the filtered total", async () => {
  const { context, requests, responses } = setup({ filters: { role: "docente", active: "false", unused: "" }, query: "Ana & Luis" });
  for (const page of [1, 2, 1]) {
    context.page = page;
    await context.exports.load();
  }
  assert.deepEqual(requests.map((params) => params.get("page")), ["1", "2", "1"]);
  for (const params of requests) {
    assert.equal(params.get("role"), "docente");
    assert.equal(params.get("active"), "false");
    assert.equal(params.get("q"), "Ana & Luis");
    assert.equal(params.get("limit"), "15");
    assert.equal(params.has("unused"), false);
  }
  assert.deepEqual(responses.map((data) => data.meta.total), [17, 17, 17]);
  assert.deepEqual(responses.map((data) => data.data.length), [15, 2, 15]);
  assert.ok(responses.every((data) => data.data.every((row) => row.role === "docente")));
});

test("FE-003: pagination without filters keeps the unfiltered request", async () => {
  const { context, requests } = setup({ filters: {}, search: undefined });
  context.config.search = undefined;
  context.page = 2;
  await context.exports.load();
  assert.deepEqual([...requests[0]], [["page", "2"], ["limit", "15"]]);
});

test("FE-003: text filters remain URL-encoded on later pages", async () => {
  const { context, requests } = setup({ filters: { code: "A & B/1", role: "" } });
  context.page = 3;
  await context.exports.load();
  assert.equal(requests[0].get("code"), "A & B/1");
  assert.equal(requests[0].has("role"), false);
  assert.equal(requests[0].has("q"), false);
});
