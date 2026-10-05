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

function valueFor(html, label) {
  const match = html.match(new RegExp(`<p[^>]*>${label}</p><p[^>]*>([^<]*)</p>`));
  assert.ok(match, `Missing indicator: ${label}`);
  return match[1];
}

for (const { students, teachers } of [{ students: 120, teachers: 8 }, { students: 120, teachers: 0 }, { students: 0, teachers: 8 }]) {
  test(`FE-027: dashboard displays ${students} students and ${teachers} teachers independently`, async () => {
    const requests = [];
    const { default: AdminHome } = load("src/app/(app)/admin/page.tsx", {
      "@/components/ui/card": { Card },
      "@/components/stat-card": { StatCard },
      "@/components/ui/feedback": { PageHeader: () => null, EmptyState: () => null },
      "@/lib/server": {
        apiGet: async (path) => {
          requests.push(path);
          return { active: { students, teachers, programs: 3, subjects: 10, classrooms: 7, groups: 5 }, faculties: 2, users: {}, currentPeriod: null };
        },
      },
    });

    const html = renderToStaticMarkup(await AdminHome());

    assert.equal(valueFor(html, "Docentes activos"), String(teachers));
    assert.equal(valueFor(html, "Estudiantes activos"), String(students));
    assert.equal(valueFor(html, "Programas"), "3");
    assert.equal(valueFor(html, "Facultades"), "2");
    assert.deepEqual(requests, ["/reports/dashboard"]);
  });
}
