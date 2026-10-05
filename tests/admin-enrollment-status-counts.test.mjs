import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function load(filename, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  });
  return exports;
}

const { Card } = load("src/components/ui/card.tsx", {
  "@/lib/cn": { cn: (...values) => values.filter(Boolean).join(" ") },
});
const { StatCard } = load("src/components/stat-card.tsx", { "@/components/ui/card": { Card } });
const counts = { activa: 12, aprobada: 7, reprobada: 3, cancelada: 2 };
const labels = { activa: "Activas", aprobada: "Aprobadas", reprobada: "Reprobadas", cancelada: "Canceladas" };
const cases = [
  { name: "all four contractual keys", values: counts },
  ...Object.keys(counts).map((missing) => ({ name: `missing ${missing}`, values: Object.fromEntries(Object.entries(counts).filter(([key]) => key !== missing)) })),
  { name: "no enrollment counts", values: {} },
];

for (const { name, values } of cases) {
  test(`FE-028: open-period enrollment counts render correctly with ${name}`, async () => {
    const requests = [];
    const { default: AdminHome } = load("src/app/(app)/admin/page.tsx", {
      "@/components/ui/card": { Card },
      "@/components/stat-card": { StatCard },
      "@/components/ui/feedback": { PageHeader: () => null, EmptyState: () => null },
      "@/lib/server": {
        apiGet: async (path) => {
          requests.push(path);
          return {
            active: { students: 120, teachers: 8, programs: 3, subjects: 10, classrooms: 7, groups: 5 }, faculties: 2, users: {},
            currentPeriod: { code: "2026-2", groups: 5, capacity: 100, enrolled: 24, occupancyPercent: 24, enrollmentsByStatus: values },
          };
        },
      },
    });

    const html = renderToStaticMarkup(await AdminHome());

    for (const [key, label] of Object.entries(labels)) {
      const match = html.match(new RegExp(`<p[^>]*>${label}</p><p[^>]*>([^<]*)</p>`));
      assert.ok(match, `Missing enrollment indicator: ${label}`);
      assert.equal(match[1], String(values[key] ?? 0), label);
    }
    assert.deepEqual(requests, ["/reports/dashboard"]);
  });
}
