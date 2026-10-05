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
const form = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "RecordForm");
const submit = form.body.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "submit");
const { outputText } = ts.transpileModule(`${submit.getText(source)}\nexports.submit = submit;`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
});

async function attempt({ valid, missing = false, mode = "create" }) {
  const calls = [];
  const exports = {};
  runInNewContext(outputText, {
    exports, missing, mode, values: { credits: "1" }, row: { _id: "test-row" },
    config: {
      endpoint: "/test-only",
      toBody: () => { calls.push("body"); return { credits: 1 }; },
    },
    setSaving: (value) => calls.push(`saving:${value}`),
    setError: () => {},
    api: async (path, options) => calls.push(`${options.method}:${path}`),
    onSaved: () => calls.push("saved"),
    message: () => "Test failure",
  });
  await exports.submit({
    preventDefault: () => calls.push("preventDefault"),
    currentTarget: { reportValidity: () => { calls.push("reportValidity"); return valid; } },
  });
  return calls;
}

test("FE-005: invalid native constraints block body construction and POST", async () => {
  assert.deepEqual(await attempt({ valid: false }), ["preventDefault", "reportValidity"]);
});

test("FE-005: invalid native constraints also block PATCH", async () => {
  assert.deepEqual(await attempt({ valid: false, mode: "edit" }), ["preventDefault", "reportValidity"]);
});

test("FE-005: missing fields block submission even without a disabled button", async () => {
  assert.deepEqual(await attempt({ valid: true, missing: true }), ["preventDefault"]);
});

for (const mode of ["create", "edit"]) {
  test(`FE-005: valid ${mode} proceeds only after checking native constraints`, async () => {
    assert.deepEqual(await attempt({ valid: true, mode }), [
      "preventDefault", "reportValidity", "saving:true", "body",
      mode === "create" ? "POST:/test-only" : "PATCH:/test-only/test-row", "saved",
    ]);
  });
}
