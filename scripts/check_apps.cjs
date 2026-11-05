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
const element = {
  innerHTML: "", addEventListener() {}, setAttribute() {}, removeAttribute() {}, focus() {},
  classList: { contains: () => false, remove() {} }
};
const location = { hash: "#/" };
const context = vm.createContext({
  assert, registry, dictionaries, URL, console, location, setTimeout, clearTimeout,
  history: { replaceState(_state, _title, hash) { location.hash = hash; } },
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

// Keep filter expectations stable as the live registry gains apps.
const registryApps = state.apps;
state.apps = [
  ["hardware", "Hardware", { additional_hardware: true }],
  ["background", "Background", { background_service: true }],
  ["motion", "Motion", { imu: true }],
  ["combined", "Combined", { imu: true, network: true }]
].map(([uuid, title, permissions]) => normalizeApp({
  uuid, title, permissions, categories: ["System Tools"]
}));
state.permissions.add("additional_hardware");
assert.equal(names(), "Hardware");
clear(); state.permissions.add("background_service");
assert.equal(names(), "Background");
clear(); state.permissions.add("imu");
assert.equal(names(), "Combined,Motion");
state.permissions.add("network");
assert.equal(names(), "Combined", "Multiple permissions must all match");
clear(); state.categories.add("Education");
assert.equal(names(), "");
renderAppsPage();
assert.ok(appRoot.innerHTML.includes("No apps available"));
assert.ok(!appRoot.innerHTML.includes("disabled"), "Empty categories remain selectable");
clear();
state.apps = registryApps;

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
assert.ok(card.includes('href="#/apps/EXAM"'), "Cards use readable share-code URLs");
assert.ok(!card.includes('class="share-code"'), "Share codes are not displayed as card labels");
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
for (const app of state.apps) {
  assert.equal(findApp(app.uuid), app);
  assert.equal(findApp(app.share_code.toLowerCase()), app);
  assert.equal(findApp(encodeURIComponent(app.share_code)), app);
  location.hash = "#/apps/" + app.uuid;
  render();
  assert.equal(location.hash, appHref(app), "UUID links redirect to the canonical short URL");
  location.hash = "#/s/" + app.share_code.toLowerCase();
  render();
  assert.equal(location.hash, appHref(app), "Legacy share links also redirect to the canonical URL");
  assert.equal(discussionTerm(app), "cardputerzero-app:" + app.uuid,
    "Changing public URLs must retain the original discussion identity");
  assert.ok(renderComments(app).includes(escapeAttr(discussionSearchUrl(app))));
}
assert.equal(findApp("%E0%A4%A"), null, "Malformed encoded URLs do not crash the page");
assert.equal(findApp("UNKNOWN-CODE"), undefined);
location.hash = "#/apps/UNKNOWN-CODE";
render();
assert.ok(appRoot.innerHTML.includes(t("notFound.title")));
for (const locale of ["zh-CN", "en", "ja"]) {
  state.locale = locale; state.dict = dictionaries[locale];
  renderHome();
  assert.ok(!appRoot.innerHTML.includes("STORE STATUS"));
  assert.ok(appRoot.innerHTML.includes(t("registry.developers")));
  assert.ok(appRoot.innerHTML.includes(t("registry.targets")));
  assert.ok(appRoot.innerHTML.includes('<a class="button secondary" href="#/documents">'));
}
state.locale = "zh-CN"; state.dict = dictionaries["zh-CN"];
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

// Exercise the iframe lifecycle without connecting to GitHub or creating comments.
const originalQuerySelector = document.querySelector;
const originalSetTimeout = setTimeout;
const originalClearTimeout = clearTimeout;
const timers = new Map();
let nextTimer = 0;
setTimeout = (callback) => { timers.set(++nextTimer, callback); return nextTimer; };
clearTimeout = (id) => timers.delete(id);
const messageHandlers = new Set();
window.addEventListener = (type, handler) => { if (type === "message") messageHandlers.add(handler); };
window.removeEventListener = (type, handler) => { if (type === "message") messageHandlers.delete(handler); };
const retryHandlers = new Set();
const retryButton = {
  hidden: true,
  addEventListener: (_type, handler) => retryHandlers.add(handler),
  removeEventListener: (_type, handler) => retryHandlers.delete(handler)
};
const loadingStatus = { textContent: "" };
const discussionLink = { href: discussionSearchUrl(sample) };
const frame = { contentWindow: {} };
const scripts = [];
const container = {
  isConnected: true, textContent: "",
  querySelector: () => frame,
  appendChild: (script) => scripts.push(script)
};
document.baseURI = "https://cardputer.cc/";
document.querySelector = (selector) => ({
  ".giscus": container,
  "[data-comments-status]": loadingStatus,
  "[data-comments-retry]": retryButton,
  "[data-discussion-link]": discussionLink
}[selector] || element);
document.createElement = () => ({ attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } });
const sendGiscus = (giscus, origin = "https://giscus.app", source = frame.contentWindow) => {
  for (const handler of messageHandlers) handler({ origin, source, data: { giscus } });
};
mountGiscus(sample);
assert.equal(scripts[0].attrs["data-term"], "cardputerzero-app:example");
assert.equal(scripts[0].attrs["data-loading"], "eager");
assert.equal(scripts[0].attrs["data-emit-metadata"], "1");
assert.equal(retryButton.hidden, true);
const actualDiscussionUrl = "https://github.com/CardputerZero/cardputerzero.github.io/discussions/31";
sendGiscus({ discussion: { url: actualDiscussionUrl } }, "https://example.com");
sendGiscus({ discussion: { url: actualDiscussionUrl } }, "https://giscus.app", {});
assert.equal(discussionLink.href, discussionSearchUrl(sample), "Ignore messages from other origins or frames");
for (const timer of [...timers.values()]) timer();
assert.equal(retryButton.hidden, false, "Slow connections expose retry and retain the GitHub link");
for (const retry of [...retryHandlers]) retry();
assert.equal(scripts.length, 2);
assert.equal(messageHandlers.size, 1, "Retry removes the previous listener");
assert.equal(timers.size, 1, "Retry removes the previous timeout");
assert.equal(retryButton.hidden, true);
sendGiscus({ discussion: { url: "https://github.com/other/repo/discussions/31" } });
assert.equal(discussionLink.href, discussionSearchUrl(sample), "Only accept this repository's discussion URLs");
sendGiscus({ discussion: { url: actualDiscussionUrl }, resizeHeight: 400 });
assert.equal(discussionLink.href, actualDiscussionUrl, "The GitHub button opens the exact loaded discussion");
assert.equal(loadingStatus.textContent, "");
assert.equal(timers.size, 0);
scripts[1].onerror();
assert.equal(retryButton.hidden, false, "Script errors offer retry");
location.hash = "#/";
render();
assert.equal(messageHandlers.size, 0, "Navigation removes iframe listeners");
assert.equal(retryHandlers.size, 0);
assert.equal(timers.size, 0);
document.querySelector = originalQuerySelector;
setTimeout = originalSetTimeout;
clearTimeout = originalClearTimeout;
console.log("Passed app metadata, filters, localization, short-link redirects, and comment lifecycle checks for " + registry.apps.length + " apps in 3 languages.");
`, context);
