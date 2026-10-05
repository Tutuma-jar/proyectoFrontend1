import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const id = "507f1f77bcf86cd799439011";

function readSource(filename) {
  return ts.createSourceFile(
    filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX,
  );
}

function evaluate(code, context) {
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  runInNewContext(outputText, { exports, require, ...context });
  return exports;
}

const buttonSource = readSource("src/app/(app)/estudiante/materias/cancel-button.tsx");
const button = buttonSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "CancelButton");
const pageSource = readSource("src/app/(app)/estudiante/materias/page.tsx");
const page = pageSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "MyEnrollmentsPage");
const apiSource = readSource("src/lib/api.ts");
const apiClass = apiSource.statements.find((node) => ts.isClassDeclaration(node) && node.name?.text === "ApiError");
const apiFunction = apiSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "api");
const childrenOnly = ({ children }) => children;

for (const responseStatus of [200, 403]) {
  test(`FE-023: cancellation ${responseStatus} ${responseStatus === 200 ? "refreshes the card" : "keeps the active card and error"}`, async () => {
    let enrollmentStatus = "activa";
    let html;
    let refreshes = 0;
    let reads = 0;
    const renders = [];
    const requests = [];
    const state = { confirming: true, loading: false, error: null };
    const client = evaluate(`${apiClass.getText(apiSource)}\n${apiFunction.getText(apiSource)}`, {
      fetch: async (url, options) => {
        requests.push({ url, method: options.method });
        if (responseStatus === 200) enrollmentStatus = "cancelada";
        return { ok: responseStatus === 200, status: responseStatus, json: async () => ({ message: "Cancellation denied" }) };
      },
    });
    const { default: renderPage } = evaluate(page.getText(pageSource), {
      apiGet: async (path) => {
        assert.equal(path, "/enrollments/mine?limit=100");
        reads += 1;
        return { data: [{ _id: id, status: enrollmentStatus, period: { code: "2026-2", status: "abierto" }, subject: { code: "TEST", name: "Test", credits: 3 }, group: { number: 1 } }] };
      },
      Badge: childrenOnly, Card: childrenOnly, PageHeader: () => null, EmptyState: () => null,
      CancelButton: () => "Cancelar",
      cn: (...values) => values.filter(Boolean).join(" "),
      grade: String, subjectTone: () => "",
      STATUS_LABEL: { activa: "En curso", cancelada: "Cancelada" },
      STATUS_TONE: { activa: "primary", cancelada: "neutral" },
    });
    async function render() {
      html = renderToStaticMarkup(await renderPage());
    }
    await render();
    assert.match(html, /En curso/);
    assert.match(html, /Cancelar/);

    let hookIndex = 0;
    const keys = ["confirming", "loading", "error"];
    const { CancelButton } = evaluate(button.getText(buttonSource), {
      ...client,
      Button: childrenOnly,
      useState: () => {
        const key = keys[hookIndex++];
        assert.ok(key, "Unexpected state hook");
        return [state[key], (value) => { state[key] = value; }];
      },
      useRouter: () => ({ refresh: () => { refreshes += 1; renders.push(render()); } }),
    });
    const tree = CancelButton({ id, name: "Test" });
    const confirm = tree.props.children.find((child) => child?.props?.variant === "danger");
    assert.ok(confirm, "The confirmation must offer a cancellation action");
    await confirm.props.onClick();
    await Promise.all(renders);

    assert.deepEqual(requests, [{ url: `/api/enrollments/${id}/cancel`, method: "POST" }]);
    assert.equal(state.loading, false);
    if (responseStatus === 200) {
      assert.equal(refreshes, 1);
      assert.equal(reads, 2);
      assert.equal(state.confirming, false);
      assert.equal(state.error, null);
      assert.match(html, /Cancelada/);
      assert.doesNotMatch(html, /En curso|Cancelar/);
    } else {
      assert.equal(refreshes, 0);
      assert.equal(reads, 1);
      assert.equal(state.confirming, true);
      assert.equal(state.error, "Cancellation denied");
      assert.match(html, /En curso/);
      assert.match(html, /Cancelar/);
    }
  });
}
