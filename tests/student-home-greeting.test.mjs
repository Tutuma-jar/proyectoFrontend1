import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const filename = "src/app/(app)/estudiante/page.tsx";
const { outputText } = ts.transpileModule(readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
  fileName: filename,
});

async function greeting(name) {
  const exports = {};
  const mocks = {
    "@/lib/server": {
      apiGet: async (path) => { assert.equal(path, "/users/me"); return { name }; },
      apiGetOrNull: async () => null,
    },
    "@/components/ui/feedback": { PageHeader: ({ title }) => createElement("h1", null, title) },
    "@/components/stat-card": { StatCard: () => null },
  };
  runInNewContext(outputText, {
    exports, require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  });
  return renderToStaticMarkup(await exports.default());
}

for (const [name, expected] of [
  ["Ana", "Hola, Ana"],
  ["Ana Ruiz", "Hola, Ana"],
  ["  Ana   Ruiz  ", "Hola, Ana"],
  ["\tAna\nRuiz", "Hola, Ana"],
  ["", "Hola, estudiante"],
  ["   \t  ", "Hola, estudiante"],
]) {
  test(`FE-030: safe greeting for ${JSON.stringify(name)}`, async () => {
    const html = await greeting(name);
    assert.equal(html.match(/<h1>(.*?)<\/h1>/)?.[1], expected);
    assert.equal(html.includes("undefined"), false);
  });
}
