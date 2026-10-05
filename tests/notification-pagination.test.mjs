import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { outputText } = ts.transpileModule(readFileSync(new URL(
  "../src/app/(app)/notificaciones/notification-list.tsx", import.meta.url,
), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
});

function notifications(count) {
  const records = Array.from({ length: count }, (_, index) => ({
    _id: `notification-${index}`, type: "aviso", title: `Notice ${index}`, message: "Test",
    createdAt: "2026-01-01T12:00:00Z", read: false,
  }));
  const state = [1, true, null, null];
  const hooks = new Map();
  const calls = [];
  const published = [];
  let cursor = 0;
  let effects = [];
  const jsx = (type, props) => ({ type, props });
  const changed = (previous, next) => !previous || next.some((value, index) => value !== previous[index]);
  const dependencies = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => {
          state[index] = typeof value === "function" ? value(state[index]) : value;
          if (index === 2 && state[index]) published.push(state[index]);
        }];
      },
      useCallback(callback, deps) {
        const index = cursor++;
        if (changed(hooks.get(index)?.deps, deps)) hooks.set(index, { deps, callback });
        return hooks.get(index).callback;
      },
      useEffect(callback, deps) {
        const index = cursor++;
        if (changed(hooks.get(index)?.deps, deps)) {
          hooks.set(index, { deps });
          effects.push(callback);
        }
      },
    },
    "lucide-react": Object.fromEntries(["Award", "BookCheck", "BookX", "CheckCheck", "Megaphone", "Presentation"].map((name) => [name, name])),
    "@/lib/api": { ApiError: Error, api: async (path, options) => {
      calls.push({ path, options });
      if (options) {
        assert.equal(options.method, "PATCH");
        if (path === "/notifications/read-all") records.forEach((record) => { record.read = true; });
        else {
          const record = records.find((item) => path === `/notifications/${item._id}/read`);
          assert.ok(record, "Unexpected mutation");
          record.read = true;
        }
        return {};
      }
      const query = new URL(path, "http://test.local").searchParams;
      const page = Number(query.get("page"));
      const limit = Number(query.get("limit"));
      const filtered = query.get("read") === "false" ? records.filter((record) => !record.read) : records;
      return { data: filtered.slice((page - 1) * limit, page * limit),
        meta: { page, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
        unread: records.filter((record) => !record.read).length };
    } },
    "@/lib/cn": { cn: () => "" },
    "@/components/ui/badge": { Badge: "Badge" },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/feedback": { Alert: "Alert", EmptyState: "EmptyState" },
  };
  const exports = {};
  runInNewContext(outputText, { exports, URL, require: (name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  function elements(node) {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!node || typeof node !== "object") return [];
    return [node, ...elements(node.props.children)];
  }
  function text(node) {
    if (Array.isArray(node)) return node.map(text).join("");
    return node && typeof node === "object" ? text(node.props.children) : String(node ?? "");
  }
  function render() {
    cursor = 0;
    return elements(exports.NotificationList());
  }
  async function flush() {
    for (let index = 0; index < 5; index += 1) {
      render();
      const pending = effects;
      effects = [];
      pending.forEach((effect) => effect());
      await Promise.resolve();
    }
    return render();
  }
  const button = (label) => render().find((node) => ["Button", "button"].includes(node.type) && text(node).trim().startsWith(label)).props;
  return { state, calls, published, flush, render, button };
}

test("FE-019: reading the last item on page 2 returns to the 15 remaining unread notifications", async () => {
  const view = notifications(16);
  await view.flush();
  view.button("Siguiente").onClick();
  await view.flush();
  assert.equal(view.state[0], 2);
  assert.equal(view.state[2].data.length, 1);
  await view.button("Marcar leída").onClick();
  const nodes = await view.flush();
  assert.equal(view.state[0], 1);
  assert.equal(view.state[2].data.length, 15);
  assert.equal(view.state[2].unread, 15);
  assert.equal(view.button("Sin leer").children, "Sin leer (15)");
  assert.equal(nodes.some((node) => node.type === "EmptyState"), false);
  assert.equal(view.published.some((result) => result.data.length === 0 && result.meta.total > 0), false);
});

test("FE-019: reading the only unread notification shows the genuine empty state", async () => {
  const view = notifications(1);
  await view.flush();
  await view.button("Marcar leída").onClick();
  const nodes = await view.flush();
  assert.equal(view.state[0], 1);
  assert.equal(view.state[2].meta.total, 0);
  assert.equal(view.state[2].unread, 0);
  assert.equal(nodes.find((node) => node.type === "EmptyState").props.title, "No tienes notificaciones sin leer");
});

test("FE-019: marking all read from page 2 resets to page 1 with an empty result", async () => {
  const view = notifications(16);
  await view.flush();
  view.button("Siguiente").onClick();
  await view.flush();
  await view.button("Marcar todas").onClick();
  await view.flush();
  assert.equal(view.state[0], 1);
  assert.equal(view.state[2].meta.total, 0);
  assert.equal(view.state[2].unread, 0);
});
