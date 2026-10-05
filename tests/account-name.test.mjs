import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function load(path, mocks = {}, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
    fileName: path,
  });
  const exports = {};
  runInNewContext(outputText, {
    exports, require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), ...globals,
  });
  return exports;
}

const Container = ({ children }) => createElement("div", null, children);
const Alert = ({ children }) => createElement("div", null, children);
const Field = () => null;
const { Button } = load("src/components/ui/button.tsx", {
  "@/lib/cn": { cn: (...classes) => classes.filter(Boolean).join(" ") },
});

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object" || !tree.props) return [];
  return [tree, ...nodes(tree.props.children)];
}

function fixture(initialName = "Ana") {
  const state = [];
  let cursor = 0;
  let name = initialName;
  let refreshes = 0;
  let resolveResponse;
  let request;
  const { api, ApiError } = load("src/lib/api.ts", {}, {
    fetch: (path, options) => {
      request = { path, options };
      return new Promise((resolve) => { resolveResponse = resolve; });
    },
  });
  const { AccountForms } = load("src/app/(app)/cuenta/account-forms.tsx", {
    react: {
      useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
      },
    },
    "next/navigation": { useRouter: () => ({ refresh: () => {
      refreshes += 1;
      name = JSON.parse(request.options.body).name;
    } }) },
    "@/lib/api": { api, ApiError },
    "@/components/ui/avatar": { Avatar: Container },
    "@/components/ui/badge": { Badge: Container },
    "@/components/ui/button": { Button },
    "@/components/ui/card": { Card: Container },
    "@/components/ui/field": { Field },
    "@/components/ui/feedback": { Alert },
  });
  function render() {
    cursor = 0;
    return nodes(AccountForms({ name, email: "test@example.com", roleLabel: "Estudiante" }));
  }
  return {
    edit: (value) => render().find((node) => node.type === Field && node.props.name === "name").props.onChange({ target: { value } }),
    disabled: () => /\bdisabled=""/.test(renderToStaticMarkup(render().find((node) => node.type === Button && node.props.children.trim() === "Guardar nombre"))),
    submit: () => render().find((node) => node.type === "form").props.onSubmit({ preventDefault() {} }),
    respond: (status, data) => resolveResponse(new Response(JSON.stringify(data), { status })),
    notice: () => render().find((node) => node.type === Alert),
    request: () => request,
    refreshes: () => refreshes,
  };
}

test("FE-002: edit, clear and restore the name update the save button", () => {
  const form = fixture();
  assert.equal(form.disabled(), true);
  form.edit("Beatriz");
  assert.equal(form.disabled(), false);
  for (const value of ["", "   ", "Ana", " Ana "]) {
    form.edit(value);
    assert.equal(form.disabled(), true, JSON.stringify(value));
  }
});

test("FE-002: surrounding whitespace does not create a false change", () => {
  const form = fixture(" Ana ");
  assert.equal(form.disabled(), true);
  form.edit("Ana");
  assert.equal(form.disabled(), true);
  form.edit(" Beatriz ");
  assert.equal(form.disabled(), false);
});

test("FE-002: save sends the trimmed name, blocks while pending and refreshes", async () => {
  const form = fixture();
  form.edit(" Beatriz ");
  assert.equal(form.disabled(), false);
  const pending = form.submit();
  assert.equal(form.disabled(), true);
  assert.equal(form.request().path, "/api/users/me");
  assert.equal(form.request().options.method, "PATCH");
  assert.deepEqual(JSON.parse(form.request().options.body), { name: "Beatriz" });
  form.respond(200, { name: "Beatriz" });
  await pending;
  assert.equal(form.refreshes(), 1);
  assert.equal(form.notice().props.children, "Nombre actualizado.");
  assert.equal(form.disabled(), true);
});

test("FE-002: a failed save displays the API error and allows retry", async () => {
  const form = fixture();
  form.edit("Beatriz");
  const pending = form.submit();
  assert.equal(form.disabled(), true);
  form.respond(400, { message: "Nombre no valido" });
  await pending;
  assert.equal(form.refreshes(), 0);
  assert.equal(form.notice().props.tone, "danger");
  assert.equal(form.notice().props.children, "Nombre no valido");
  assert.equal(form.disabled(), false);
});
