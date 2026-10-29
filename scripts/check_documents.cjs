#!/usr/bin/env node
// Run with Node 20+: node scripts/check_documents.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dictionaries = Object.fromEntries(["zh-CN", "en", "ja"].map((locale) => [
  locale, JSON.parse(fs.readFileSync(path.join(root, `site/i18n/${locale}.json`), "utf8"))
]));
const registry = JSON.parse(fs.readFileSync(path.join(root, "generated/registry.json"), "utf8"));
const node = { innerHTML: "", dataset: {} };
const toc = { innerHTML: "" };
const chrome = { classList: { remove() {} }, focus() {} };
const app = {
  html: "",
  get innerHTML() { return this.html; },
  set innerHTML(value) {
    this.html = value;
    node.innerHTML = "";
    node.dataset.documentPath = value.match(/data-document-path="([^"]+)"/)?.[1];
  },
  insertAdjacentHTML(_, html) { this.html = html + this.html; },
  focus() {}
};
const fetchFile = async (url) => ({
  ok: true,
  text: async () => fs.readFileSync(path.join(root, url.split("?")[0]), "utf8")
});
const context = vm.createContext({
  assert, dictionaries, registry, node, toc, fetchFile, console, URL,
  document: {
    querySelector(selector) {
      if (selector === "#app") return app;
      if (selector === ".markdown-doc") return node.dataset.documentPath ? node : null;
      if (selector === ".doc-toc") return node.dataset.documentPath ? toc : null;
      return chrome;
    },
    querySelectorAll: () => [], addEventListener() {}
  },
  window: { addEventListener() {} },
  location: { hash: "#/documents", replace(hash) { this.hash = hash; } },
  localStorage: { getItem: () => null }, navigator: { language: "en" }, fetch: fetchFile
});

const source = fs.readFileSync(path.join(root, "site/app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.ok(!html.includes('href="emulator/"'));
assert.ok(!html.includes('href="#/registry"'));
assert.ok(!/App ?Store|APPSTORE/.test(html));

vm.runInContext(source + `
(async () => {
  state.registry = registry;
  state.apps = registry.apps.map(normalizeApp);
  for (const locale of ["zh-CN", "en", "ja"]) {
    state.locale = locale; state.dict = dictionaries[locale];
    renderDocuments();
    assert.equal((appRoot.innerHTML.match(/class="document-card"/g) || []).length, 3);
    assert.ok(!appRoot.innerHTML.includes("wip-banner"));
    assert.ok(!/App ?Store|APPSTORE/.test(JSON.stringify(state.dict)));
    const panel = renderRegistryPanel();
    assert.equal((panel.match(/class="status-item"/g) || []).length, 4);
    assert.ok(panel.includes("https://github.com/CardputerZero/packages"));
    assert.ok(!panel.includes("#/registry") && !panel.includes("registry.json"));
    for (const doc of DOCUMENTS) {
      await renderDocument(doc.slug);
      assert.equal((node.innerHTML.match(/<h1\\b/g) || []).length, 1, locale + ": " + doc.slug);
      assert.ok(!appRoot.innerHTML.includes("<h1"), "The shell must not duplicate the Markdown title");
      assert.ok(!appRoot.innerHTML.includes("wip-banner"));
      const ids = new Set(Array.from(node.innerHTML.matchAll(/id="([^"]+)"/g), match => match[1]));
      const anchors = Array.from(toc.innerHTML.matchAll(/data-doc-anchor="([^"]+)"/g), match => match[1]);
      assert.ok(anchors.length > 0);
      for (const anchor of anchors) assert.ok(ids.has(anchor), "Missing heading for TOC anchor " + anchor);
      if (doc.slug === "cp0-dev") assert.ok(node.innerHTML.includes("code-copy-button"));
    }
  }

  location.hash = "#/registry";
  render();
  assert.equal(location.hash, "#/", "Old registry links redirect home");

  state.documentCache.clear();
  let finishOldRequest;
  fetch = (url) => url.startsWith("docs/zh-CN/CP0_dev.md")
    ? new Promise(resolve => { finishOldRequest = () => resolve(fetchFile(url)); })
    : fetchFile(url);
  state.locale = "zh-CN"; state.dict = dictionaries["zh-CN"];
  const oldRequest = renderDocument("cp0-dev");
  state.locale = "en"; state.dict = dictionaries.en;
  await renderDocument("cp0-dev");
  const english = node.innerHTML;
  finishOldRequest();
  await oldRequest;
  assert.equal(node.innerHTML, english, "An older language request must not replace the current document");
  console.log("Passed 9 document renders, title and TOC integrity, Store naming, source summary, and legacy redirect checks.");
})()
`, context).catch(error => { console.error(error); process.exitCode = 1; });
