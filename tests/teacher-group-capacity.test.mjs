import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { outputText } = ts.transpileModule(readFileSync(new URL(
  "../src/app/(app)/docente/grupos/page.tsx", import.meta.url,
), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
});

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object") return [];
  return [node, ...elements(node.props.children)];
}

function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  return node && typeof node === "object" ? text(node.props.children) : String(node ?? "");
}

for (const enrolled of [0, 8, 30]) {
  test(`FE-025: a group with ${enrolled} enrollments and 30 seats shows ${enrolled} / 30`, async () => {
    const group = { _id: "group", number: 1, capacity: 30, enrolled, active: true,
      subject: { code: "TEST", name: "Test subject" },
      period: { _id: "period", code: "2026-1", status: "abierto" }, schedule: [] };
    const jsx = (type, props) => ({ type, props });
    const dependencies = {
      "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
      "next/link": "Link",
      "lucide-react": { ChevronRight: "ChevronRight", Clock: "Clock", DoorOpen: "DoorOpen", Users: "Users" },
      "@/components/ui/badge": { Badge: "Badge" },
      "@/components/ui/card": { Card: "Card" },
      "@/components/ui/feedback": { EmptyState: "EmptyState", PageHeader: "PageHeader" },
      "@/lib/cn": { cn: () => "" },
      "@/lib/format": { DAY_SHORT: {}, subjectTone: () => "" },
      "./period-select": { PeriodSelect: "PeriodSelect" },
      "@/lib/server": {
        apiGetOrNull: async () => group.period,
        apiGet: async (path) => {
          if (path === "/periods?limit=100") return { data: [group.period] };
          assert.ok(path.startsWith("/groups/mine?"), `Unexpected request: ${path}`);
          return { data: [group] };
        },
      },
    };
    const exports = {};
    runInNewContext(outputText, { exports, require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    } });
    const tree = await exports.default({ searchParams: Promise.resolve({}) });
    const occupancy = elements(tree).find((node) => node.type === "Badge" && node.props.tone === "primary");
    assert.ok(occupancy);
    assert.equal(text(occupancy).trim(), `${enrolled} / 30 estudiantes`);
  });
}
