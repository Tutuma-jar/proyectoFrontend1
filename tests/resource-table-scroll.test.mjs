import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { chromium } = require("@playwright/test");
const { compile } = require("tailwindcss");
function source(filename) {
  return ts.createSourceFile(filename, readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
const manager = source("src/components/admin/resource-manager.tsx");
let tableCard;
function visit(node) {
  if (ts.isJsxElement(node) && node.openingElement.tagName.getText(manager) === "Card"
    && node.getText(manager).includes("<table")) tableCard = node;
  ts.forEachChild(node, visit);
}
visit(manager);
assert.ok(tableCard, "ResourceManager must contain the table Card");
const cardSource = source("src/components/ui/card.tsx");
const card = cardSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "Card");
const cnSource = source("src/lib/cn.ts");
const cn = cnSource.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "cn");
const { outputText } = ts.transpileModule([
  cn.getText(cnSource).replace("export ", ""),
  card.getText(cardSource).replace("export ", ""),
  `exports.table = (${tableCard.getText(manager)});`,
].join("\n"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
});
const exports = {};
runInNewContext(outputText, {
  exports, require,
  data: { data: [{ _id: "test-row", code: "TEST", name: "Registro sintético" }] },
  config: {
    columns: [{ header: "Código", cell: (row) => row.code }, { header: "Nombre", cell: (row) => row.name }],
    rowActions: () => React.createElement("button", { "aria-label": "Operar" }, "Operar"),
  },
  lk: () => "", load: () => {}, setNotice: () => {}, setForm: () => {},
  Pencil: () => React.createElement("span", null, "Editar"),
});
const markup = renderToStaticMarkup(exports.table);
let browser;
let css;
before(async () => {
  const compiler = await compile("@tailwind utilities;");
  css = compiler.build(["overflow-hidden", "overflow-x-auto", "w-full", "min-w-[40rem]"]);
  browser = await chromium.launch({ headless: true });
});
after(async () => { await browser?.close(); });

for (const width of [375, 768, 1280]) {
  test(`FE-009: columns and actions are reachable at ${width}px without page overflow`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    try {
      await page.setContent(`<style>${css} body { margin: 0; padding: 16px; } table { border-collapse: collapse; } td, th { padding: 8px; }</style>${markup}`);
      const metrics = await page.locator("table").evaluate((table) => {
        const scroller = table.parentElement;
        const card = scroller.parentElement;
        return {
          overflowX: getComputedStyle(scroller).overflowX,
          cardOverflow: getComputedStyle(card).overflow,
          scrollWidth: scroller.scrollWidth,
          clientWidth: scroller.clientWidth,
          pageWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });
      assert.equal(metrics.overflowX, "auto");
      assert.equal(metrics.cardOverflow, "hidden");
      assert.ok(metrics.pageWidth <= metrics.viewportWidth);
      if (width === 375) assert.ok(metrics.scrollWidth > metrics.clientWidth);
      await page.locator("table").evaluate((table) => {
        table.parentElement.scrollLeft = table.parentElement.scrollWidth;
      });
      for (const label of ["Operar", "Editar"]) {
        const action = page.getByRole("button", { name: label, exact: true });
        const reachable = await action.evaluate((button) => {
          const bounds = button.getBoundingClientRect();
          const container = button.closest("table").parentElement.getBoundingClientRect();
          return bounds.left >= container.left && bounds.right <= container.right;
        });
        assert.equal(reachable, true, `${label} must be visible after horizontal scrolling`);
        await action.click();
      }
    } finally {
      await page.close();
    }
  });
}
