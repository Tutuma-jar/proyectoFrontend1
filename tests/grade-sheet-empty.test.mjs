import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { outputText } = ts.transpileModule(readFileSync(new URL(
  "../src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx", import.meta.url,
), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
});

function panel(saved = 4) {
  const sheet = {
    evaluations: [{ id: "exam", name: "Exam", weight: 50 }, { id: "quiz", name: "Quiz", weight: 50 }],
    summary: { totalWeight: 100, planComplete: true, students: 1, readyToFinalize: 1 },
    rows: [{ enrollment: "student", status: "activa", student: { name: "Test", code: "test" },
      grades: { exam: saved, quiz: 3 }, evaluatedWeight: 100, accumulated: 3.5, readyToFinalize: true }],
  };
  const state = [sheet, {}];
  let cursor = 0;
  const calls = [];
  let resolveSave;
  const jsx = (type, props) => ({ type, props });
  const dependencies = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
      },
      useMemo: (calculate) => calculate(), useCallback: (callback) => callback, useEffect: () => {},
    },
    "lucide-react": { CheckCheck: "CheckCheck", Save: "Save" },
    "@/lib/api": { ApiError: Error, api: (path, options) => {
      calls.push({ path, options });
      if (!options) return Promise.resolve(sheet);
      assert.equal(path, "/grades/bulk", "No finalization requests are permitted in this test");
      return new Promise((resolve) => { resolveSave = resolve; });
    } },
    "@/lib/cn": { cn: (...values) => values.join(" ") },
    "@/lib/format": { grade: String, STATUS_LABEL: {}, STATUS_TONE: {} },
    "@/components/ui/badge": { Badge: "Badge" },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/card": { Card: "Card" },
    "@/components/ui/feedback": { Alert: "Alert", EmptyState: "EmptyState" },
  };
  const exports = {};
  runInNewContext(outputText, { exports, require: (name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  function elements(node) {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!node || typeof node !== "object") return [];
    return [node, ...elements(node.props.children)];
  }
  function render() {
    cursor = 0;
    return elements(exports.GradeSheetPanel({ groupId: "group", readOnly: false }));
  }
  function input(name) {
    return render().find((node) => node.type === "input" && node.props["aria-label"] === `${name} de Test`).props;
  }
  function text(node) {
    if (Array.isArray(node)) return node.map(text).join("");
    return node && typeof node === "object" ? text(node.props.children) : String(node ?? "");
  }
  function button(label) {
    return render().find((node) => node.type === "Button" && text(node).trim().startsWith(label)).props;
  }
  return { input, button, calls, edit: (name, value) => input(name).onChange({ target: { value } }),
    resolve: () => resolveSave({ saved: 1, failed: [] }) };
}

for (const blank of ["", "   "]) {
  test(`FE-008: clearing a saved grade to ${JSON.stringify(blank)} is invalid and blocks saving/finalization`, () => {
    const view = panel();
    view.edit("Exam", blank);
    assert.equal(view.input("Exam").value, blank);
    assert.equal(view.input("Exam")["aria-invalid"], true);
    assert.equal(view.button("Guardar").disabled, true);
    assert.equal(view.button("Finalizar").disabled, true);
    view.edit("Quiz", "4");
    assert.equal(view.button("Guardar").disabled, true);
    assert.equal(view.calls.length, 0);
    view.edit("Exam", "4");
    assert.equal(view.input("Exam")["aria-invalid"], false);
    assert.equal(view.button("Guardar").disabled, false);
  });
}

test("FE-008: restoring the saved grade removes the pending change", () => {
  const view = panel();
  view.edit("Exam", "");
  view.edit("Exam", "4");
  assert.equal(view.button("Guardar").disabled, true);
  assert.equal(view.button("Finalizar").disabled, false);
});

test("FE-008: a grade already missing stays empty without an invalid change", () => {
  const view = panel(null);
  view.edit("Exam", "");
  assert.equal(view.input("Exam")["aria-invalid"], false);
  assert.equal(view.button("Guardar").disabled, true);
});

test("FE-008: clearing a saved zero is also an invalid change", () => {
  const view = panel(0);
  view.edit("Exam", "");
  assert.equal(view.input("Exam")["aria-invalid"], true);
  assert.equal(view.button("Finalizar").disabled, true);
});

test("FE-008: clearing a grade after opening confirmation disables Confirmar", () => {
  const view = panel();
  view.button("Finalizar").onClick();
  view.edit("Exam", "");
  assert.equal(view.button("Confirmar").disabled, true);
  assert.equal(view.calls.length, 0);
});

test("FE-008: clearing a grade during another save remains visible and pending", async () => {
  const view = panel();
  view.edit("Quiz", "4");
  const pending = view.button("Guardar").onClick();
  view.edit("Exam", "");
  view.resolve();
  await pending;
  assert.equal(view.input("Exam").value, "");
  assert.equal(view.input("Exam")["aria-invalid"], true);
  assert.equal(view.button("Finalizar").disabled, true);
  const items = view.calls[0].options.body.items;
  assert.equal(items.length, 1);
  assert.equal(items[0].evaluation, "quiz");
  assert.equal(items[0].value, 4);
});
