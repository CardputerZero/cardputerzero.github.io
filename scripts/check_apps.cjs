#!/usr/bin/env node
// Run with Node 20+: node scripts/check_apps.cjs [path/to/registry.json]
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const registry = JSON.parse(fs.readFileSync(process.argv[2] || path.join(root, "generated/registry.json"), "utf8"));
const dictionaries = Object.fromEntries(["zh-CN", "en", "ja"].map((locale) => [
  locale, JSON.parse(fs.readFileSync(path.join(root, `site/i18n/${locale}.json`), "utf8"))
]));
const element = { innerHTML: "", addEventListener() {}, focus() {}, classList: { contains: () => false } };
const context = vm.createContext({
  assert, registry, dictionaries, URL, console,
  document: {
    querySelector: (selector) => selector === ".giscus" ? null : element,
    querySelectorAll: () => [], addEventListener() {}
  },
  window: { addEventListener() {} }, localStorage: { getItem: () => null }, navigator: { language: "en" }
});
vm.runInContext(fs.readFileSync(path.join(root, "site/app.js"), "utf8") + `
state.registry = registry;
state.apps = registry.apps.map(normalizeApp);
state.locale = "en";
state.dict = dictionaries.en;
const names = () => getFilteredApps().map((app) => app.title).sort().join(",");
const clear = () => { state.query = ""; state.categories.clear(); state.permissions.clear(); };

state.permissions.add("additional_hardware");
assert.equal(names(), "MeshTerm,RFID,RaspyJack,Retro-Zero,ZeroRadio");
clear(); state.permissions.add("background_service");
assert.equal(names(), "RaspyJack");
clear(); state.permissions.add("imu");
assert.equal(names(), state.apps.some((app) => app.title === "Tools") ? "RaspyJack,Tools" : "RaspyJack");
state.permissions.add("network");
assert.equal(names(), "RaspyJack", "Multiple permissions must all match");
clear(); state.categories.add("Education");
assert.equal(names(), "");
renderAppsPage();
assert.ok(appRoot.innerHTML.includes("No apps available"));
assert.ok(!appRoot.innerHTML.includes("disabled"), "Empty categories remain selectable");
clear();

const catalogApps = state.apps;
const catalogSort = state.sort;
state.apps = [
  ["old-featured", "A", "2026-10-01T00:00:00Z"],
  ["middle", "B", "2026-10-20T00:00:00Z"],
  ["no-date", "C", ""],
  ["latest", "Z", "2026-10-29T09:00:00+08:00"],
  ["second", "Y", "2026-10-28T23:00:00Z"],
  ["third", "X", "2026-10-25T00:00:00Z"],
  ["fourth", "W", "2026-10-24T00:00:00Z"],
  ["invalid-date", "D", "invalid"]
].map(([uuid, title, updated_at]) => normalizeApp({
  uuid, title, updated_at, featured: uuid === "old-featured",
  published_at: uuid === "old-featured" ? "2026-10-30T00:00:00Z" : ""
}));
const originalOrder = state.apps.map((app) => app.uuid);
for (const sort of ["name", "published", "updated"]) {
  state.sort = sort;
  renderHome();
  const homeIds = [...appRoot.innerHTML.matchAll(/class="app-card-link" href="#\\/apps\\/([^\"]+)"/g)].map((match) => match[1]);
  assert.equal(homeIds.join(","), "latest,second,third",
    "Home shows three latest updates, independently of names, featured flags, publish dates and catalog sort");
  assert.equal(state.apps.map((app) => app.uuid).join(","), originalOrder.join(","), "Home must not reorder the catalog data");
}
state.apps = catalogApps;
state.sort = catalogSort;

const sample = normalizeApp({
  uuid: "example", share_code: "EXAM", version: "1.0.0",
  title: "Example", summary: "Default English", author: { display_name: "Display only" },
  permissions: { camera: false, microphone: "false", network: true, additional_hardware: true },
  download: { package: "example", size: 1048576 },
  locales: { "zh-CN": { summary: "中文" } }, i18n: { ja: { summary: "日本語" } }
});
assert.equal(sample.permissions.camera, false);
assert.equal(sample.permissions.microphone, null, "Strings are not boolean declarations");
assert.equal(sample.permissions.imu, null, "Missing declaration remains unknown");
assert.equal(sample.updated_at, "", "Missing app dates must not become registry generation time");
assert.equal(localized(sample, "summary"), "Default English", "Missing translations fall back to English");
state.locale = "ja";
assert.equal(localized(sample, "summary"), "日本語");
state.locale = "en";
assert.equal(formatFileSize(1048576), "1 MiB");
assert.equal(formatFileSize(undefined), "—");
const card = renderAppCard(sample);
assert.ok(card.includes("Display only"));
assert.ok(card.includes("1 MiB"), "Cards display the package size");
assert.ok(!card.includes("EXAM"), "Cards do not display the share code");
assert.ok(!card.includes("undefined") && !card.includes("@undefined"));
assert.ok(!card.includes("Approved") && !card.includes("unknown"));

for (const locale of ["zh-CN", "en", "ja"]) {
  state.locale = locale; state.dict = dictionaries[locale];
  for (const key of APP_CATEGORIES) assert.ok(state.dict.categories[key]);
  for (const key of APP_PERMISSIONS) {
    assert.ok(state.dict.permissions[key]); assert.ok(state.dict.permissionStatements[key]);
  }
  const filters = renderFilters();
  assert.equal((filters.match(/name="category"/g) || []).length, 13);
  assert.equal((filters.match(/name="permission"/g) || []).length, 7);
  assert.ok(!filters.includes("disabled") && !filters.includes("source-filter"));
  for (const app of state.apps) {
    renderDetail(app.uuid);
    const html = appRoot.innerHTML;
    assert.equal((html.match(/class="permission-declaration"/g) || []).length, 7);
    assert.ok(!html.includes("mock registry") && !html.includes("undefined"));
    assert.ok(!html.includes("review.status") && !html.includes('class="badge unknown"'));
    assert.ok(html.includes(escapeAttr(app.source_repo)));
    assert.ok(html.includes('class="technical-info"'));
    assert.ok(html.includes('aria-label="' + t("detail.copyChecksum", { algorithm: "SHA256" }) + '"'));
    const appCard = renderAppCard(app);
    assert.ok(!/badge (approved|unknown)/.test(appCard));
    assert.ok(!appCard.includes('class="share-code"'));
    assert.ok(appCard.includes(escapeHtml(formatFileSize(app.download.size))));
    assert.equal((appCard.match(/class="badge category"/g) || []).length, app.categories.length);
    assert.equal((appCard.match(/class="badge capability"/g) || []).length, declaredPermissions(app).length);
  }
  assert.ok(!renderPermissionDeclarations(sample).includes("undefined"));
}

state.locale = "zh-CN"; state.dict = dictionaries["zh-CN"];
state.query = "无线通信";
assert.ok(names().includes("MeshTerm"), "Search must recognize translated categories");
clear(); state.query = "fontpreview";
assert.equal(names(), "FontPreview", "English and package search work in Chinese");
clear();
state.apps.push(normalizeApp({
  uuid: "missing-data", title: "Missing", share_code: "MISS", summary: "Summary fallback",
  author: { display_name: "Author" }, assets: { icon: "icon.png", screenshots: [] },
  download: {}, permissions: {}
}));
renderDetail("missing-data");
assert.ok(appRoot.innerHTML.includes("暂无截图"));
assert.ok(appRoot.innerHTML.includes("Summary fallback"));
assert.ok(appRoot.innerHTML.includes("未声明"));
assert.ok(!appRoot.innerHTML.includes('class="screenshot"'));
assert.ok(!appRoot.innerHTML.includes("无敏感权限"));
const allFalse = normalizeApp({ permissions: Object.fromEntries(APP_PERMISSIONS.map((key) => [key, false])) });
assert.ok(renderPermissionDeclarations(allFalse).includes("未声明需要上述权限或能力"));
console.log("Passed app metadata, filters, localization, and detail checks for " + registry.apps.length + " apps in 3 languages.");
`, context);
