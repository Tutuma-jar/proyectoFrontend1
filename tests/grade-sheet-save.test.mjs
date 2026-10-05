import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const filename = "src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx";
const source = ts.createSourceFile(
  filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX,
);
const panel = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "GradeSheetPanel");
const save = panel.body.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "save");
const { outputText } = ts.transpileModule(`${save.getText(source)}\nexports.save = save;`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
});

async function saveWhileEditing({ sent, current, failed = [], expected }) {
  let drafts = Object.fromEntries(sent.map((change) => [change.k, change.text]));
  let resolveResponse;
  const response = new Promise((resolve) => { resolveResponse = resolve; });
  let request;
  let saving = false;
  let reloads = 0;
  let notice;
  const exports = {};
  runInNewContext(outputText, {
    exports,
    changes: sent,
    setSaving: (value) => { saving = value; },
    setNotice: (value) => { notice = value; },
    setResult: () => {},
    setDrafts: (update) => { drafts = update(drafts); },
    api: (path, options) => {
      request = { path, options };
      return response;
    },
    load: async () => { reloads += 1; },
    message: (error) => error.message,
  });
  const pending = exports.save();
  assert.equal(saving, true);
  assert.equal(request.path, "/grades/bulk");
  assert.equal(request.options.method, "PUT");
  assert.equal(JSON.stringify(request.options.body.items), JSON.stringify(sent.map(({ enrollment, evaluation, value }) => ({ enrollment, evaluation, value }))));
  drafts = { ...current };
  resolveResponse({ saved: sent.length - failed.length, failed });
  await pending;
  assert.equal(saving, false);
  assert.equal(reloads, 1);
  assert.equal(notice.tone, failed.length ? "danger" : "success");
  assert.deepEqual({ ...drafts }, expected);
}

const change = (enrollment, text) => ({ enrollment, evaluation: "exam", k: `${enrollment}:exam`, text, value: Number(text) });
const a = change("student-a", "3");
const b = change("student-b", "4");

test("FE-017: a new cell edited during save remains pending", async () => {
  await saveWhileEditing({ sent: [a], current: { [a.k]: "3", [b.k]: "4" }, expected: { [b.k]: "4" } });
});

test("FE-017: a newer value in a submitted cell remains pending", async () => {
  await saveWhileEditing({ sent: [a], current: { [a.k]: "4" }, expected: { [a.k]: "4" } });
});

test("FE-017: partial success preserves failed and newer drafts", async () => {
  await saveWhileEditing({
    sent: [a, b], current: { [a.k]: "5", [b.k]: "4", "student-c:exam": "2" },
    failed: [{ index: 1, reason: "Test failure" }],
    expected: { [a.k]: "5", [b.k]: "4", "student-c:exam": "2" },
  });
});

test("FE-017: partial success removes only unchanged successful drafts", async () => {
  await saveWhileEditing({
    sent: [a, b], current: { [a.k]: "3", [b.k]: "4" },
    failed: [{ index: 1, reason: "Test failure" }], expected: { [b.k]: "4" },
  });
});

test("FE-017: complete success clears unchanged submitted drafts", async () => {
  await saveWhileEditing({ sent: [a, b], current: { [a.k]: "3", [b.k]: "4" }, expected: {} });
});
