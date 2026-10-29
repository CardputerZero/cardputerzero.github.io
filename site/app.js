const REGISTRY_URL = "generated/registry.json";
// The app grid renders 3 columns, so page sizes are multiples of 3 to keep
// full rows. The user's choice persists in localStorage.
const DEFAULT_PAGE_SIZE = 30;
const PAGE_SIZE_OPTIONS = [6, 12, 18, 30, 60, 90];
const PAGE_SIZE_STORAGE_KEY = "cz_apps_page_size";
const APP_CATEGORIES = [
  "System Tools", "Development", "Hardware & IoT", "Security", "Radio & Comms",
  "AI", "Creative & Office", "Media", "Games", "Emulators", "Education", "Lifestyle", "Other"
];
const APP_PERMISSIONS = [
  "camera", "microphone", "imu", "network", "additional_hardware", "background_service", "external_display"
];

function loadPageSize() {
  const stored = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
  return PAGE_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_PAGE_SIZE;
}
const SUPPORTED_LOCALES = ["zh-CN", "en", "ja"];
const APP_LOADED_AT = new Date();
const REGISTRY_LOADED_URL = withTimestamp(REGISTRY_URL, APP_LOADED_AT);
const GISCUS_CONFIG = {
  repo: "CardputerZero/cardputerzero.github.io",
  repoId: "R_kgDOSWq5Vw",
  category: "App Comments",
  categoryId: "DIC_kwDOSWq5V84C8kA5"
};
const DOCUMENTS = [
  {
    slug: "cp0-keys",
    paths: {
      "zh-CN": "docs/zh-CN/CP0_keys.md",
      en: "docs/en/CP0_keys.md",
      ja: "docs/ja/CP0_keys.md"
    },
    titleKey: "documents.items.keys.title",
    summaryKey: "documents.items.keys.summary"
  },
  {
    slug: "cp0-dev",
    paths: {
      "zh-CN": "docs/zh-CN/CP0_dev.md",
      en: "docs/en/CP0_dev.md",
      ja: "docs/ja/CP0_dev.md"
    },
    titleKey: "documents.items.cp0Dev.title",
    summaryKey: "documents.items.cp0Dev.summary"
  },
  {
    slug: "cp0-submit",
    paths: {
      "zh-CN": "docs/zh-CN/CP0_submit.md",
      en: "docs/en/CP0_submit.md",
      ja: "docs/ja/CP0_submit.md"
    },
    titleKey: "documents.items.submission.title",
    summaryKey: "documents.items.submission.summary"
  }
];

const state = {
  registry: null,
  apps: [],
  dict: {},
  locale: resolveInitialLocale(),
  query: "",
  categories: new Set(),
  permissions: new Set(),
  sort: "updated",
  page: 1,
  pageSize: loadPageSize(),
  filtersOpen: false,
  filterTimer: null,
  searchComposing: false,
  restoreQueryFocus: false,
  querySelectionStart: null,
  querySelectionEnd: null,
  selectedFlowStep: "dev-0",
  documentCache: new Map()
};

const appRoot = document.querySelector("#app");
const localeSelect = document.querySelector("#locale-select");
const nav = document.querySelector("#nav");
const navToggle = document.querySelector("#nav-toggle");

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", () => {
  state.page = 1;
  render();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
});

async function init() {
  localeSelect.value = state.locale;
  localeSelect.addEventListener("change", async (event) => {
    state.locale = event.target.value;
    localStorage.setItem("hub.locale", state.locale);
    document.documentElement.lang = state.locale;
    state.dict = await loadLocale(state.locale);
    updateStaticChrome();
    render();
  });

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  try {
    const [registry, dict] = await Promise.all([
      fetchJson(REGISTRY_LOADED_URL),
      loadLocale(state.locale)
    ]);
    state.registry = registry;
    state.apps = registry.apps.map(normalizeApp);
    state.dict = dict;
    document.documentElement.lang = state.locale;
    updateStaticChrome();
    render();
  } catch (error) {
    appRoot.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function updateStaticChrome() {
  document.title = t("meta.title");
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("meta.description"));
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load ${url}: ${response.status}`);
  }
  return response.json();
}

function withTimestamp(url, date) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${formatUrlTimestamp(date)}`;
}

function formatUrlTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function normalizeApp(app) {
  const author = app.author && typeof app.author === "object" ? app.author : {};
  return {
    ...app,
    title: app.title || app.app_name || app.download?.package || "",
    categories: app.categories || [],
    author,
    locales: app.locales || {},
    i18n: app.i18n || {},
    published_at: app.published_at || "",
    updated_at: app.updated_at || "",
    source_repo: app.source_repo || app.source?.repository || "",
    review: app.review || { status: app.review_status || "approved" },
    download: app.download || {},
    permissions: Object.fromEntries(APP_PERMISSIONS.map((key) => [
      key, typeof app.permissions?.[key] === "boolean" ? app.permissions[key] : null
    ])),
    risk_flags: app.risk_flags || [],
    assets: {
      icon: app.assets?.icon || app.icon || "",
      screenshots: app.assets?.screenshots || app.screenshots || []
    }
  };
}

async function loadLocale(locale) {
  const response = await fetch(withTimestamp(`site/i18n/${locale}.json`, APP_LOADED_AT));
  if (!response.ok) {
    return fetchJson(withTimestamp("site/i18n/zh-CN.json", APP_LOADED_AT));
  }
  return response.json();
}

function resolveInitialLocale() {
  const stored = localStorage.getItem("hub.locale");
  if (SUPPORTED_LOCALES.includes(stored)) return stored;
  const browser = navigator.language || "";
  if (SUPPORTED_LOCALES.includes(browser)) return browser;
  if (browser.startsWith("zh")) return "zh-CN";
  if (browser.startsWith("ja")) return "ja";
  if (browser.startsWith("en")) return "en";
  return "zh-CN";
}

function render() {
  const route = parseRoute();
  updateNav(route.name);

  if (route.name === "detail") {
    renderDetail(route.id);
  } else if (route.name === "share") {
    const app = state.apps.find((item) => item.share_code.toLowerCase() === route.code.toLowerCase());
    if (app) {
      location.hash = `#/apps/${app.uuid}`;
    } else {
      renderNotFound();
    }
  } else if (route.name === "tutorial") {
    renderTutorial();
  } else if (route.name === "documents") {
    renderDocuments();
  } else if (route.name === "document") {
    renderDocument(route.slug);
    nav.classList.remove("open");
    appRoot.focus({ preventScroll: true });
    return;
  } else if (route.name === "registry") {
    location.replace("#/");
    return;
  } else if (route.name === "apps") {
    renderAppsPage();
  } else {
    renderHome();
  }

  if (!["home", "apps", "detail", "share", "documents"].includes(route.name)) {
    appRoot.insertAdjacentHTML("afterbegin", renderWipBanner());
  }
  nav.classList.remove("open");
  appRoot.focus({ preventScroll: true });
}

function renderWipBanner() {
  return `
    <section class="wip-banner" role="status">
      <strong>${t("wip.title")}</strong>
      <span>${t("wip.body")}</span>
    </section>
  `;
}

function parseRoute() {
  const hash = location.hash || "#/";
  const path = hash.replace(/^#\/?/, "");
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "apps" && parts[1]) return { name: "detail", id: parts[1] };
  if (parts[0] === "apps") return { name: "apps" };
  if (parts[0] === "s" && parts[1]) return { name: "share", code: parts[1] };
  if (parts[0] === "tutorial" || parts[0] === "submit") return { name: "tutorial" };
  if (parts[0] === "documents" && parts[1]) return { name: "document", slug: parts[1] };
  if (parts[0] === "documents") return { name: "documents" };
  if (parts[0] === "policy") return { name: "document", slug: "user-agreement" };
  if (parts[0] === "registry") return { name: "registry" };
  return { name: "home" };
}

function updateNav(routeName) {
  const activeName = routeName === "document" ? "documents" : routeName;
  document.querySelectorAll("[data-nav]").forEach((item) => {
    const active = item.dataset.nav === activeName;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

function renderHome() {
  const recent = [...state.apps]
    .sort((a, b) => dateTimeValue(b.updated_at) - dateTimeValue(a.updated_at))
    .slice(0, 3);

  appRoot.innerHTML = `
    <section class="route-panel home-page">
      <header class="home-intro">
        <div>
          <h1>${t("home.title")}</h1>
          <p class="lead">${t("home.lead")}</p>
        </div>
      </header>
      <div class="home-grid">
        <div class="home-feature">
          <figure class="home-banner">
            <img src="assets/home-store.png" width="1480" height="940" alt="${escapeAttr(t("home.bannerAlt"))}" fetchpriority="high">
          </figure>
          <div class="home-actions">
            <a class="button" href="#/apps">
              <span class="home-action-role">${t("home.usersRole")}</span>
              <span class="home-action-label">${t("home.usersCta")}</span>
            </a>
            <a class="button secondary" href="https://dev.cardputer.cc" target="_blank" rel="noopener noreferrer">
              <span class="home-action-role">${t("home.developersRole")}</span>
              <span class="home-action-label">${t("home.developersCta")}</span>
            </a>
          </div>
        </div>
        ${renderRegistryPanel()}
      </div>
      <section class="home-documents" aria-labelledby="home-documents-title">
        <div class="section-head">
          <div>
            <h2 id="home-documents-title">${t("home.documentsTitle")}</h2>
            <p>${t("home.documentsLead")}</p>
          </div>
          <a class="button secondary" href="#/documents">${t("actions.viewAll")}</a>
        </div>
        <div class="documents-grid">${DOCUMENTS.map((doc) => renderDocumentCard(doc, "h3")).join("")}</div>
      </section>
      <section class="home-recent">
        <div class="section-head">
          <div>
            <h2>${t("home.featured")}</h2>
            <p>${t("home.featuredLead")}</p>
          </div>
          <a class="button secondary" href="#/apps">${t("actions.viewAll")}</a>
        </div>
        <div class="app-grid">${recent.map((app) => renderAppCard(app, true)).join("")}</div>
      </section>
    </section>
  `;

}

function renderRegistryPanel() {
  const registry = state.registry;

  return `
    <aside class="registry-panel">
      <p class="eyebrow">${t("registry.status")}</p>
      <h2>${t("registry.title")}</h2>
      <div class="status-stack">
        <div class="status-item">
          <span class="status-label">${t("registry.apps")}</span>
          <span class="status-value">${state.apps.length}</span>
        </div>
        <div class="status-item">
          <span class="status-label">${t("registry.updated")}</span>
          <span class="status-value">${formatDate(registry.generated_at)}</span>
        </div>
        <div class="status-item">
          <span class="status-label">${t("registry.targets")}</span>
          <span class="status-value">${escapeHtml((registry.device_targets || []).join(" / ") || "—")}</span>
        </div>
        <div class="status-item">
          <span class="status-label">${t("registry.source")}</span>
          <a class="status-value" href="https://github.com/CardputerZero/packages" target="_blank" rel="noopener noreferrer">CardputerZero/<wbr>packages</a>
        </div>
      </div>
    </aside>
  `;
}

function renderAppsPage() {
  const existingFilters = document.querySelector("#filters");
  if (existingFilters) {
    state.filtersOpen = existingFilters.classList.contains("open");
  }

  const filtered = getFilteredApps();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const offset = (state.page - 1) * state.pageSize;
  const pageApps = filtered.slice(offset, offset + state.pageSize);

  appRoot.innerHTML = `
    <section class="route-panel apps-page">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("apps.eyebrow")}</p>
          <h1>${t("apps.title")}</h1>
          <p class="lead">${t("apps.lead")}</p>
        </div>
      </div>
      <div class="list-layout">
        ${renderFilters()}
        <section class="apps-results">
          <div class="results-head">
            <div>
              <h2>${t("apps.results", { count: filtered.length })}</h2>
              <div class="active-filters">${renderActiveFilters()}</div>
            </div>
            <div class="results-actions">
              <button class="button secondary filter-toggle" id="filter-toggle" type="button">${t("filters.open")}</button>
              <label class="visually-hidden" for="sort-select">${t("sort.label")}</label>
              <select class="select" id="sort-select">
                ${option("updated", t("sort.updated"), state.sort)}
                ${option("published", t("sort.published"), state.sort)}
                ${option("name", t("sort.name"), state.sort)}
              </select>
            </div>
          </div>
          ${pageApps.length ? `<div class="app-grid">${pageApps.map((app) => renderAppCard(app)).join("")}</div>` : `<div class="empty">${t("apps.empty")}</div>`}
          ${renderPagination(totalPages)}
        </section>
      </div>
    </section>
  `;

  bindFilterEvents();
}

function renderFilters() {
  const counts = new Map(APP_CATEGORIES.map((category) => [
    category, state.apps.filter((app) => app.categories.includes(category)).length
  ]));
  return `
    <aside class="filters ${state.filtersOpen ? "open" : ""}" id="filters">
      <div class="filters-header">
        <h2>${t("filters.title")}</h2>
        <button class="button secondary" id="clear-filters" type="button">${t("filters.clear")}</button>
      </div>
      <div class="filter-group">
        <label class="filter-group-title" for="apps-query">${t("search.label")}</label>
        <input class="input" id="apps-query" type="search" value="${escapeAttr(state.query)}" placeholder="${t("search.placeholder")}">
      </div>
      <div class="filter-group">
        <span class="filter-group-title">${t("filters.categories")}</span>
        ${APP_CATEGORIES.map((category) => checkbox("category", category, labelFor("categories", category), state.categories.has(category), counts.get(category))).join("")}
      </div>
      <div class="filter-group">
        <span class="filter-group-title">${t("filters.permissions")}</span>
        ${APP_PERMISSIONS.map((permission) => checkbox("permission", permission, labelFor("permissions", permission), state.permissions.has(permission))).join("")}
      </div>
    </aside>
  `;
}

function bindFilterEvents() {
  document.querySelector("#filter-toggle")?.addEventListener("click", () => {
    state.filtersOpen = !state.filtersOpen;
    document.querySelector("#filters").classList.toggle("open", state.filtersOpen);
  });

  const queryInput = document.querySelector("#apps-query");
  queryInput.addEventListener("compositionstart", () => {
    state.searchComposing = true;
    clearTimeout(state.filterTimer);
  });
  queryInput.addEventListener("compositionend", (event) => {
    state.searchComposing = false;
    state.query = event.target.value;
    state.page = 1;
    scheduleSearchRender(event.target, 0);
  });
  queryInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    state.page = 1;
    if (event.isComposing || state.searchComposing) return;
    scheduleSearchRender(event.target, 220);
  });

  document.querySelectorAll("input[name='category']").forEach((input) => {
    input.addEventListener("change", () => updateSetFilter(state.categories, input.value, input.checked));
  });

  document.querySelectorAll("input[name='permission']").forEach((input) => {
    input.addEventListener("change", () => updateSetFilter(state.permissions, input.value, input.checked));
  });

  document.querySelector("#sort-select").addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.page = 1;
    renderAppsPage();
  });

  document.querySelector("#clear-filters").addEventListener("click", () => {
    state.query = "";
    state.categories.clear();
    state.permissions.clear();
    state.page = 1;
    renderAppsPage();
  });

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = Number(button.dataset.page);
      renderAppsPage();
    });
  });

  document.querySelector("#page-size-select")?.addEventListener("change", (event) => {
    state.pageSize = Number(event.target.value);
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(state.pageSize));
    state.page = 1;
    renderAppsPage();
  });

  restoreQueryInputFocus();
}

function scheduleSearchRender(input, delay) {
  state.restoreQueryFocus = document.activeElement === input;
  state.querySelectionStart = input.selectionStart;
  state.querySelectionEnd = input.selectionEnd;
  clearTimeout(state.filterTimer);
  state.filterTimer = setTimeout(renderAppsPage, delay);
}

function restoreQueryInputFocus() {
  if (!state.restoreQueryFocus) return;
  state.restoreQueryFocus = false;
  const input = document.querySelector("#apps-query");
  if (!input) return;
  input.focus({ preventScroll: true });
  if (state.querySelectionStart != null && state.querySelectionEnd != null) {
    try {
      input.setSelectionRange(state.querySelectionStart, state.querySelectionEnd);
    } catch {
      // Some input types do not expose selection ranges in every browser.
    }
  }
}

function updateSetFilter(set, value, enabled) {
  if (enabled) {
    set.add(value);
  } else {
    set.delete(value);
  }
  state.page = 1;
  renderAppsPage();
}

function getFilteredApps() {
  const query = state.query.trim().toLowerCase();
  return state.apps.filter((app) => {
    const text = [
      app.uuid, app.share_code, app.download.package,
      app.author.github, app.author.display_name, app.author.website,
      app.title, app.summary, app.description,
      app.categories.join(" "),
      app.categories.map((category) => labelFor("categories", category)).join(" "),
      localized(app, "title"), localized(app, "summary"), localized(app, "description")
    ].join(" ").toLowerCase();
    if (query && !text.includes(query)) return false;
    if (state.categories.size && !app.categories.some((category) => state.categories.has(category))) return false;
    if (![...state.permissions].every((permission) => hasPermission(app, permission))) return false;
    return true;
  }).sort(sortApps);
}

function sortApps(a, b) {
  if (state.sort === "published") return dateTimeValue(b.published_at) - dateTimeValue(a.published_at);
  if (state.sort === "name") return localized(a, "title").localeCompare(localized(b, "title"), state.locale);
  return dateTimeValue(b.updated_at) - dateTimeValue(a.updated_at);
}

function renderAppCard(app, showUpdated = false) {
  const categoryBadges = app.categories.map((category) => badge(labelFor("categories", category), "category")).join("");
  const permissions = declaredPermissions(app);
  const permissionBadges = permissions.map((permission) => badge(labelFor("permissions", permission), "capability")).join("");
  const noRequirements = APP_PERMISSIONS.every((permission) => app.permissions[permission] === false);
  const authorName = authorDisplayName(app);
  const github = authorGithubUrl(app) ? `@${new URL(authorGithubUrl(app)).pathname.replaceAll("/", "")}` : "";
  const authorText = [authorName, github && github !== `@${authorName}` ? github : ""].filter(Boolean).join(" · ");
  const updatedDate = showUpdated ? parseDate(app.updated_at) : null;
  return `
    <article class="app-card">
      <a class="app-card-link" href="#/apps/${app.uuid}">
        <div class="app-card-head">
          <img class="app-icon" src="${escapeAttr(app.assets.icon)}" alt="${escapeAttr(localized(app, "title"))}">
          <div class="app-title-block">
            <h3>${escapeHtml(localized(app, "title"))}</h3>
            ${authorText ? `<p class="app-author" title="${escapeAttr(authorText)}">${escapeHtml(authorText)}</p>` : ""}
          </div>
        </div>
        <div class="app-package-meta">
          <div class="app-package-field"><span class="card-meta-label">${escapeHtml(t("fields.version"))}</span><span class="card-meta-value">${escapeHtml(app.version || "—")}</span></div>
          <div class="app-package-field"><span class="card-meta-label">${escapeHtml(t("fields.size"))}</span><span class="card-meta-value">${escapeHtml(formatFileSize(app.download.size))}</span></div>
        </div>
        <p class="app-summary">${escapeHtml(localized(app, "summary"))}</p>
        <div class="app-taxonomy">
          <div class="app-tag-group">
            <span class="card-group-label">${escapeHtml(t("filters.categories"))}</span>
            <div class="badge-row app-categories">${categoryBadges}</div>
          </div>
          <div class="app-tag-group">
            <span class="card-group-label">${escapeHtml(t("filters.permissions"))}</span>
            <div class="badge-row app-signals">${permissionBadges || `<span class="card-permissions-empty">${escapeHtml(t(noRequirements ? "detail.noRequirements" : "detail.undeclared"))}</span>`}</div>
          </div>
        </div>
        ${showUpdated ? `<p class="app-updated"><span>${escapeHtml(t("fields.updated"))}</span>${updatedDate ? `<time datetime="${updatedDate.toISOString()}">${escapeHtml(formatDate(updatedDate))}</time>` : `<span>—</span>`}</p>` : ""}
      </a>
    </article>
  `;
}

function renderDetail(id) {
  const app = state.apps.find((item) => item.uuid === id);
  if (!app) {
    renderNotFound();
    return;
  }
  const screenshots = app.assets.screenshots.length
    ? `<div class="screenshots">${app.assets.screenshots.map((src, index) => `<img class="screenshot" src="${escapeAttr(src)}" alt="${escapeAttr(t("detail.screenshotAlt", { title: localized(app, "title"), number: index + 1 }))}" loading="lazy">`).join("")}</div>`
    : `<p class="markdown-copy">${escapeHtml(t("detail.noScreenshots"))}</p>`;
  const downloadUrl = safeExternalUrl(app.download.url);
  appRoot.innerHTML = `
    <section class="route-panel app-detail">
      <a class="button secondary detail-back" href="#/apps">${t("actions.backToApps")}</a>
      <div class="detail-layout">
        <article class="section-panel detail-main">
          <div class="detail-hero">
            <img class="detail-icon" src="${escapeAttr(app.assets.icon)}" alt="${escapeAttr(localized(app, "title"))}">
            <div>
              <p class="eyebrow">${escapeHtml(app.categories.map((category) => labelFor("categories", category)).join(" / "))}</p>
              <h1>${escapeHtml(localized(app, "title"))}</h1>
              <p class="detail-summary">${escapeHtml(localized(app, "summary"))}</p>
            </div>
          </div>
          <section class="detail-section">
            <h2>${t("detail.about")}</h2>
            <p class="markdown-copy">${escapeHtml(localized(app, "description") || localized(app, "summary"))}</p>
          </section>
          <section class="detail-section">
            <h2>${t("detail.screenshots")}</h2>
            ${screenshots}
          </section>
          <section class="detail-section">
            <h2>${t("detail.permissions")}</h2>
            ${renderPermissionDeclarations(app)}
          </section>
          ${app.risk_flags.length ? `<section class="detail-section">
            <h2>${t("detail.risks")}</h2>
            <div class="badge-row">${app.risk_flags.map((risk) => badge(labelFor("risks", risk), "warning")).join("")}</div>
          </section>` : ""}
        </article>
        <aside class="detail-aside">
          <div class="install-heading">
            <h2>${t("detail.install")}</h2>
            <p class="markdown-copy">${t("detail.installLead")}</p>
          </div>
          ${downloadUrl ? `<a class="button download-button" href="${escapeAttr(downloadUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("actions.download"))}</a>` : `<p>${escapeHtml(t("detail.noDownload"))}</p>`}
          <div class="install-share">
            <p class="meta-label">${escapeHtml(t("fields.shareCode"))}</p>
            <div class="copy-row">
              <code>${escapeHtml(app.share_code)}</code>
              <button class="button secondary" data-copy="${escapeAttr(app.share_code)}" type="button">${t("actions.copy")}</button>
            </div>
          </div>
          <div class="meta-list">
            ${metaExternalLink(t("fields.author"), authorDisplayName(app), authorGithubUrl(app))}
            ${authorWebsiteUrl(app) ? metaExternalLink(t("fields.website"), urlDisplayText(authorWebsiteUrl(app)), authorWebsiteUrl(app), true) : ""}
            ${meta(t("fields.package"), app.download.package || "—", true)}
            ${meta(t("fields.version"), app.version || "—")}
            ${meta(t("fields.size"), formatFileSize(app.download.size))}
            ${meta(t("fields.updated"), formatDate(app.updated_at))}
            ${metaExternalLink(t("fields.sourceRepo"), app.source_repo ? urlDisplayText(app.source_repo) : t("detail.notProvided"), app.source_repo, true)}
            ${meta(t("fields.license"), app.license || t("detail.notProvided"))}
          </div>
          <details class="technical-info">
            <summary>${escapeHtml(t("detail.technicalInfo"))}</summary>
            <div class="meta-list">
              ${renderChecksum("MD5", app.download.md5)}
              ${renderChecksum("SHA256", app.download.sha256)}
              ${metaExternalLink(t("fields.download"), downloadUrl, downloadUrl, true)}
              ${meta(t("fields.uuid"), app.uuid, true)}
            </div>
          </details>
        </aside>
      </div>
      ${renderComments(app)}
    </section>
  `;
  bindCopyButtons();
  mountGiscus(app);
}

function renderComments(app) {
  return `
    <section class="section-panel comments-panel">
      <div class="section-head compact">
        <div>
          <h2>${t("detail.comments")}</h2>
          <p>${t("detail.commentsLead")}</p>
        </div>
        <a class="button secondary" href="https://github.com/${GISCUS_CONFIG.repo}/discussions/categories/app-comments" rel="noopener noreferrer" target="_blank">${t("detail.openDiscussions")}</a>
      </div>
      <div class="giscus" id="giscus-${escapeAttr(app.uuid)}"></div>
    </section>
  `;
}

function renderChecksum(algorithm, value) {
  if (!value) return "";
  return `<div class="meta-row"><span>${escapeHtml(algorithm)}</span><div class="copy-row"><code>${escapeHtml(value)}</code><button class="button secondary" data-copy="${escapeAttr(value)}" type="button" aria-label="${escapeAttr(t("detail.copyChecksum", { algorithm }))}">${escapeHtml(t("actions.copy"))}</button></div></div>`;
}

function formatFileSize(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return "—";
  const units = ["B", "KiB", "MiB", "GiB"];
  const index = value >= 1 ? Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1) : 0;
  return `${new Intl.NumberFormat(state.locale, { maximumFractionDigits: index ? 1 : 0 }).format(value / 1024 ** index)} ${units[index]}`;
}

function mountGiscus(app) {
  const container = document.querySelector(".giscus");
  if (!container) return;
  container.textContent = "";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", GISCUS_CONFIG.repo);
  script.setAttribute("data-repo-id", GISCUS_CONFIG.repoId);
  script.setAttribute("data-category", GISCUS_CONFIG.category);
  script.setAttribute("data-category-id", GISCUS_CONFIG.categoryId);
  script.setAttribute("data-mapping", "specific");
  script.setAttribute("data-term", `cardputerzero-app:${app.uuid}`);
  script.setAttribute("data-strict", "1");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", giscusThemeUrl());
  script.setAttribute("data-lang", giscusLang());
  script.setAttribute("data-loading", "lazy");
  container.appendChild(script);
}

function giscusThemeUrl() {
  return new URL("site/giscus-theme.css", document.baseURI).href;
}

function giscusLang() {
  if (state.locale === "ja") return "ja";
  if (state.locale === "en") return "en";
  return "zh-CN";
}

function renderTutorial() {
  appRoot.innerHTML = `
    <section class="route-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("tutorial.eyebrow")}</p>
          <h1>${t("tutorial.title")}</h1>
          <p class="lead">${t("tutorial.lead")}</p>
        </div>
      </div>
      <section class="notice-panel">
        <div>
          <p class="eyebrow">${t("tutorial.agreementEyebrow")}</p>
          <h2>${t("tutorial.agreementTitle")}</h2>
          <p>${t("tutorial.agreementLead")}</p>
        </div>
        <div class="notice-actions">
          <a class="button" href="#/documents/user-agreement">${t("tutorial.readAgreement")}</a>
          <a class="button secondary" href="#/documents/app-submission-guide">${t("tutorial.openGuide")}</a>
        </div>
      </section>
      <section class="section-panel">
        <div class="section-head">
          <div>
            <h2>${t("tutorial.flowTitle")}</h2>
            <p>${t("tutorial.flowLead")}</p>
          </div>
        </div>
        ${renderWorkflowMap()}
      </section>
      <div class="two-column">
        <section class="submit-band">
          <h2>${t("tutorial.developmentTitle")}</h2>
          <p>${t("tutorial.developmentLead")}</p>
          <a class="button secondary" href="#/documents/application-development-guide">${t("documents.open")}</a>
        </section>
        <section class="submit-band">
          <h2>${t("tutorial.skillTitle")}</h2>
          <p>${t("tutorial.skillLead")}</p>
          <a class="button secondary" href="#/documents/skill-ai-coding-guide">${t("documents.open")}</a>
        </section>
      </div>
      <div class="two-column">
        <section class="submit-band">
          <h2>${t("tutorial.reviewTitle")}</h2>
          <p>${t("tutorial.reviewLead")}</p>
          <a class="button secondary" href="#/documents/developer-submission-policy">${t("documents.open")}</a>
        </section>
        <section class="submit-band">
          <h2>${t("documents.items.agreement.title")}</h2>
          <p>${t("documents.items.agreement.summary")}</p>
          <a class="button secondary" href="#/documents/user-agreement">${t("documents.open")}</a>
        </section>
      </div>
      <div class="submit-grid">
        ${renderSubmitBand("tutorial.metadataTitle", "tutorial.metadata")}
        ${renderSubmitBand("tutorial.ciTitle", "tutorial.ci")}
        ${renderSubmitBand("tutorial.maintainerTitle", "tutorial.maintainer")}
      </div>
    </section>
  `;
  bindTutorialFlow();
}

function renderWorkflowMap() {
  const steps = getWorkflowSteps();
  const selected = steps.find((step) => step.key === state.selectedFlowStep) || steps[0];
  return `
    <div class="workflow-board" aria-label="${escapeAttr(t("tutorial.flowTitle"))}">
      <div class="workflow-map">
        <section class="workflow-lane">
          <div class="workflow-lane-head">
            <span>${t("tutorial.devLane")}</span>
          </div>
          ${t("tutorial.devFlow").map((step, index) => renderFlowNode(step, index, "dev", selected.key)).join("")}
        </section>
        <section class="workflow-lane review-lane">
          <div class="workflow-lane-head">
            <span>${t("tutorial.reviewLane")}</span>
          </div>
          ${t("tutorial.reviewFlow").map((step, index) => renderFlowNode(step, index, "review", selected.key)).join("")}
        </section>
      </div>
      <aside class="flow-detail" aria-live="polite">
        <p class="eyebrow">${escapeHtml(t("tutorial.detailTitle"))}</p>
        <h3>${escapeHtml(selected.title)}</h3>
        <p>${escapeHtml(selected.body)}</p>
        ${selected.checks?.length ? `
          <div class="flow-checks">
            <strong>${escapeHtml(t("tutorial.checksTitle"))}</strong>
            <ul>${selected.checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        ` : ""}
        ${selected.doc ? `
          <a class="button secondary" href="#/documents/${escapeAttr(selected.doc)}">${escapeHtml(t("tutorial.openDocument"))}</a>
        ` : ""}
      </aside>
    </div>
  `;
}

function getWorkflowSteps() {
  const devSteps = t("tutorial.devFlow").map((step, index) => ({
    ...step,
    lane: "dev",
    key: `dev-${index}`
  }));
  const reviewSteps = t("tutorial.reviewFlow").map((step, index) => ({
    ...step,
    lane: "review",
    key: `review-${index}`
  }));
  return devSteps.concat(reviewSteps);
}

function renderFlowNode(step, index, lane, selectedKey) {
  const key = `${lane}-${index}`;
  const isActive = key === selectedKey;
  return `
    <button class="flow-step ${isActive ? "active" : ""}" data-flow-step="${escapeAttr(key)}" type="button" aria-pressed="${isActive}">
      <span class="flow-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="flow-title">${escapeHtml(step.title)}</span>
      <span class="flow-body">${escapeHtml(step.body)}</span>
    </button>
  `;
}

function bindTutorialFlow() {
  document.querySelectorAll("[data-flow-step]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedFlowStep = button.dataset.flowStep;
      render();
    });
  });
}

function documentPath(doc) {
  return doc.paths?.[state.locale] || doc.paths?.["zh-CN"] || doc.paths?.en || doc.path;
}

function renderDocumentSource(doc) {
  return t("documents.source", { path: documentPath(doc) });
}

function renderSubmitBand(titleKey, listKey) {
  return `
    <section class="submit-band">
      <h2>${t(titleKey)}</h2>
      <ul>${t(listKey).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function renderDocuments() {
  appRoot.innerHTML = `
    <section class="route-panel documents-index">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("documents.eyebrow")}</p>
          <h1>${t("documents.title")}</h1>
          <p class="lead">${t("documents.lead")}</p>
        </div>
      </div>
      <section class="notice-panel">
        <div>
          <p class="eyebrow">${t("documents.portal.eyebrow")}</p>
          <h2>${t("documents.portal.title")}</h2>
          <p>${t("documents.portal.body")}</p>
        </div>
        <div class="notice-actions">
          <a class="button" href="https://dev.cardputer.cc" target="_blank" rel="noopener noreferrer">${t("documents.portal.cta")} →</a>
        </div>
      </section>
      <section class="documents-grid">
        ${DOCUMENTS.map((doc) => renderDocumentCard(doc)).join("")}
      </section>
    </section>
  `;
}

function renderDocumentCard(doc, headingTag = "h2") {
  return `
    <article class="document-card">
      <a href="#/documents/${escapeAttr(doc.slug)}">
        <${headingTag}>${escapeHtml(t(doc.titleKey))}</${headingTag}>
        <p>${escapeHtml(t(doc.summaryKey))}</p>
        <span class="document-card-action">${escapeHtml(t("documents.open"))}</span>
      </a>
    </article>
  `;
}

async function renderDocument(slug) {
  const doc = DOCUMENTS.find((item) => item.slug === slug);
  if (!doc) {
    renderNotFound();
    return;
  }
  const path = documentPath(doc);

  appRoot.innerHTML = `
    <section class="route-panel document-page">
      <a class="button secondary document-back" href="#/documents">${t("documents.back")}</a>
      <div class="document-layout">
        <aside class="doc-toc" aria-label="${escapeAttr(t("documents.toc"))}">
          <p class="eyebrow">${t("documents.toc")}</p>
          <p>${t("documents.loading")}</p>
        </aside>
        <article class="section-panel markdown-doc" aria-live="polite" data-document-path="${escapeAttr(path)}">
          <p>${t("documents.loading")}</p>
        </article>
      </div>
    </section>
  `;

  try {
    const markdown = await loadMarkdown(path);
    if (document.querySelector(".markdown-doc")?.dataset.documentPath !== path) return;
    const rendered = renderMarkdown(markdown);
    const docNode = document.querySelector(".markdown-doc");
    const tocNode = document.querySelector(".doc-toc");
    if (docNode) docNode.innerHTML = rendered.html;
    if (tocNode) tocNode.innerHTML = renderToc(rendered.toc);
    bindDocumentToc();
    bindCopyButtons();
  } catch (error) {
    if (document.querySelector(".markdown-doc")?.dataset.documentPath !== path) return;
    const docNode = document.querySelector(".markdown-doc");
    if (docNode) docNode.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
    const tocNode = document.querySelector(".doc-toc");
    if (tocNode) tocNode.innerHTML = `<p class="eyebrow">${t("documents.toc")}</p>`;
  }
}

async function loadMarkdown(path) {
  if (state.documentCache.has(path)) return state.documentCache.get(path);
  const response = await fetch(withTimestamp(path, APP_LOADED_AT));
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }
  const markdown = await response.text();
  state.documentCache.set(path, markdown);
  return markdown;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  const headingIds = new Map();
  let paragraph = [];
  let listType = null;
  let inCode = false;
  let codeLines = [];
  let codeLanguage = "";

  function flushParagraph() {
    if (!paragraph.length) return;
    const paragraphText = paragraph.join(" ");
    const tag = isDocumentImageRow(paragraphText) ? "div" : "p";
    const className = tag === "div" ? ' class="doc-image-row"' : "";
    html.push(`<${tag}${className}>${renderInlineMarkdown(paragraphText)}</${tag}>`);
    paragraph = [];
  }

  function flushList() {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const codeFence = line.match(/^```\s*([A-Za-z0-9_+#.-]+)?\s*$/);
    if (codeFence) {
      if (inCode) {
        html.push(renderCodeBlock(codeLines, codeLanguage));
        inCode = false;
        codeLines = [];
        codeLanguage = "";
      } else {
        flushParagraph();
        flushList();
        inCode = true;
        codeLanguage = codeFence[1] || "";
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      flushParagraph();
      flushList();
      const tableLines = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && isMarkdownTableRow(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      html.push(renderMarkdownTable(tableLines));
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)(?:\{width=(\d{1,4})(%|px)?\})?$/);
    if (image) {
      flushParagraph();
      flushList();
      html.push(`<figure class="doc-figure">${renderDocumentImage(image[2], image[1], image[3], image[4], image[5])}</figure>`);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const title = heading[2].trim();
      const id = uniqueHeadingId(title, headingIds);
      if (level <= 3) toc.push({ id, level, title });
      html.push(`<h${level} id="${escapeAttr(id)}">${renderInlineMarkdown(title)}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const wanted = unordered ? "ul" : "ol";
      if (listType !== wanted) {
        flushList();
        html.push(`<${wanted}>`);
        listType = wanted;
      }
      html.push(`<li>${renderInlineMarkdown((unordered || ordered)[1])}</li>`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  if (inCode) html.push(renderCodeBlock(codeLines, codeLanguage));
  return { html: html.join("\n"), toc };
}

function renderCodeBlock(lines, languageHint = "") {
  const code = lines.join("\n");
  const language = normalizeCodeLanguage(languageHint) || inferCodeLanguage(code);
  const copyLabel = escapeHtml(t("actions.copy"));
  return `
    <div class="code-block-wrap">
      <button class="code-copy-button" data-code-copy type="button" aria-label="${escapeAttr(t("actions.copy"))}">${copyLabel}</button>
      <pre class="code-block"><code class="language-${escapeAttr(language)}">${highlightCode(code, language)}</code></pre>
    </div>
  `;
}

function normalizeCodeLanguage(language) {
  const name = String(language || "").trim().toLowerCase();
  const aliases = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    c: "cpp",
    h: "cpp",
    "c++": "cpp",
    hpp: "cpp",
    html: "markup",
    xml: "markup",
    svg: "markup",
    yml: "yaml",
    text: "plain",
    txt: "plain"
  };
  const supported = new Set([
    "javascript", "typescript", "python", "shell", "cpp", "json", "jsonc",
    "markup", "css", "scss", "yaml", "toml", "ini", "markdown", "plain"
  ]);
  const normalized = aliases[name] || name;
  return supported.has(normalized) ? normalized : "";
}

function inferCodeLanguage(code) {
  const text = String(code || "");
  const trimmed = text.trim();
  if (!trimmed) return "plain";
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch (error) {
      // Continue with the remaining lightweight language checks.
    }
  }
  if (/^\s*<\/?[A-Za-z][\s\S]*>/m.test(text)) return "markup";
  if (/(?:^|\n)\s*(?:\$\s*)?(?:git|gh|npm|pnpm|yarn|bun|python3?|pip3?|curl|wget|cd|mkdir|cp|mv|ssh|sudo|apt)\b/m.test(text)) return "shell";
  if (/#include\s*[<"]|\bstd::|\bint\s+main\s*\(/.test(text)) return "cpp";
  if (/\b(?:def|elif|print|self|None|True|False)\b|(?:^|\n)\s*(?:from|import)\s+[A-Za-z_.]+/m.test(text)) return "python";
  if (/\b(?:const|let|var|function|export|async|await)\b|=>/.test(text)) return "javascript";
  if (/(?:^|\n)\s*(?:[.#][\w-]+|[A-Za-z][\w-]*)\s*\{[\s\S]*:[^;{}]+;/m.test(text)) return "css";
  return "plain";
}

function highlightCode(code, language) {
  const commonStrings = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
  const commonNumbers = /\b(?:0x[\da-f]+|\d+(?:\.\d+)?)\b/gi;
  const patterns = [];
  const add = (pattern, className, priority = patterns.length) => {
    patterns.push({ pattern, className, priority });
  };

  if (language === "json" || language === "jsonc") {
    if (language === "jsonc") add(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "code-token-comment");
    add(/"(?:\\.|[^"\\])*"(?=\s*:)/g, "code-token-property");
    add(commonStrings, "code-token-string");
    add(/\b(?:true|false|null)\b/g, "code-token-literal");
    add(commonNumbers, "code-token-number");
  } else if (language === "markup") {
    add(/<!--[\s\S]*?-->/g, "code-token-comment");
    add(/<\/?[A-Za-z][\w:.-]*/g, "code-token-keyword");
    add(commonStrings, "code-token-string");
    add(/\b[A-Za-z_:][\w:.-]*(?=\s*=)/g, "code-token-property");
  } else if (language === "css" || language === "scss") {
    add(/\/\*[\s\S]*?\*\//g, "code-token-comment");
    add(commonStrings, "code-token-string");
    add(/(?:--)?[A-Za-z_-][\w-]*(?=\s*:)/g, "code-token-property");
    add(/#[\da-f]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|deg)?\b/gi, "code-token-number");
    add(/![A-Za-z-]+\b/g, "code-token-keyword");
  } else if (language === "python") {
    add(/#[^\n]*/g, "code-token-comment");
    add(/'''[\s\S]*?'''|"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "code-token-string");
    add(/\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/g, "code-token-keyword");
    add(/\b[A-Za-z_]\w*(?=\s*\()/g, "code-token-function");
    add(commonNumbers, "code-token-number");
  } else if (language === "shell") {
    add(/#[^\n]*/g, "code-token-comment");
    add(commonStrings, "code-token-string");
    add(/\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/g, "code-token-property");
    add(/(?:^|\n)\s*(?:\$\s*)?[A-Za-z0-9_./-]+/g, "code-token-function");
    add(/(?:^|\s)--?[A-Za-z0-9][\w-]*/g, "code-token-keyword");
    add(/\b(?:if|then|else|elif|fi|for|while|in|do|done|case|esac|function)\b/g, "code-token-keyword");
    add(commonNumbers, "code-token-number");
  } else if (["javascript", "typescript", "cpp"].includes(language)) {
    add(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "code-token-comment");
    add(/`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "code-token-string");
    const keywords = language === "cpp"
      ? /\b(?:alignas|auto|bool|break|case|catch|char|class|const|constexpr|continue|default|delete|do|double|else|enum|explicit|extern|false|float|for|friend|if|inline|int|long|namespace|new|nullptr|operator|private|protected|public|return|short|signed|sizeof|static|struct|switch|template|this|throw|true|try|typedef|typename|union|unsigned|using|virtual|void|volatile|while)\b/g
      : /\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|false|finally|for|from|function|get|if|import|in|instanceof|interface|let|new|null|of|return|set|static|super|switch|this|throw|true|try|typeof|undefined|var|void|while|yield)\b/g;
    add(keywords, "code-token-keyword");
    add(/\b[A-Za-z_$][\w$]*(?=\s*\()/g, "code-token-function");
    add(commonNumbers, "code-token-number");
  } else if (["yaml", "toml", "ini"].includes(language)) {
    add(/#[^\n]*|;[^\n]*/g, "code-token-comment");
    add(commonStrings, "code-token-string");
    add(/(?:^|\n)\s*[A-Za-z_][\w.-]*(?=\s*[:=])/g, "code-token-property");
    add(/\b(?:true|false|null|yes|no|on|off)\b/gi, "code-token-literal");
    add(commonNumbers, "code-token-number");
  } else {
    add(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*/g, "code-token-comment");
    add(commonStrings, "code-token-string");
    add(/\b(?:true|false|null|none)\b/gi, "code-token-literal");
    add(commonNumbers, "code-token-number");
  }

  return renderHighlightedRanges(String(code || ""), patterns);
}

function renderHighlightedRanges(code, patternSpecs) {
  const ranges = [];
  patternSpecs.forEach(({ pattern, className, priority }) => {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(code))) {
      if (!match[0]) {
        pattern.lastIndex += 1;
        continue;
      }
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        className,
        priority
      });
    }
  });
  ranges.sort((left, right) => left.start - right.start || left.priority - right.priority || right.end - left.end);

  let cursor = 0;
  let html = "";
  ranges.forEach((range) => {
    if (range.start < cursor) return;
    html += escapeHtml(code.slice(cursor, range.start));
    html += `<span class="${range.className}">${escapeHtml(code.slice(range.start, range.end))}</span>`;
    cursor = range.end;
  });
  return html + escapeHtml(code.slice(cursor));
}

function isMarkdownTableStart(lines, index) {
  return isMarkdownTableRow(lines[index]) && isMarkdownTableDivider(lines[index + 1]);
}

function isMarkdownTableRow(line) {
  return Boolean(line && line.includes("|") && splitMarkdownTableRow(line).length > 1);
}

function isMarkdownTableDivider(line) {
  if (!isMarkdownTableRow(line)) return false;
  return splitMarkdownTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function splitMarkdownTableRow(line) {
  let text = String(line).trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|")) text = text.slice(0, -1);

  const cells = [];
  let cell = "";
  let escaped = false;
  for (const char of text) {
    if (char === "|" && !escaped) {
      cells.push(cell.trim().replace(/\\\|/g, "|"));
      cell = "";
    } else {
      cell += char;
    }
    escaped = char === "\\" && !escaped;
    if (char !== "\\") escaped = false;
  }
  cells.push(cell.trim().replace(/\\\|/g, "|"));
  return cells;
}

function renderMarkdownTable(lines) {
  const header = splitMarkdownTableRow(lines[0]);
  const alignments = splitMarkdownTableRow(lines[1]).map((cell) => {
    const marker = cell.replace(/\s+/g, "");
    if (marker.startsWith(":") && marker.endsWith(":")) return "center";
    if (marker.endsWith(":")) return "right";
    return "left";
  });
  const rows = lines.slice(2).map(splitMarkdownTableRow);
  const columnCount = header.length;
  const columnWidths = getMarkdownTableColumnWidths([header, ...rows], columnCount);
  const renderCell = (cell, index, tag) => {
    const align = alignments[index] || "left";
    return `<${tag} class="doc-table-${align}">${renderInlineMarkdown(cell || "")}</${tag}>`;
  };
  return `
    <div class="doc-table-wrap">
      <table class="doc-table">
        <colgroup>
          ${columnWidths.map((width) => `<col style="width: ${width}%">`).join("")}
        </colgroup>
        <thead>
          <tr>${header.map((cell, index) => renderCell(cell, index, "th")).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>${Array.from({ length: columnCount }, (_, index) => renderCell(row[index], index, "td")).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function getMarkdownTableColumnWidths(rows, columnCount) {
  const weights = Array.from({ length: columnCount }, (_, columnIndex) => {
    const maxLength = Math.max(
      ...rows.map((row) => measureMarkdownTableCell(row[columnIndex] || ""))
    );
    return Math.min(72, Math.max(6, maxLength));
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  return weights.map((weight) => Number(((weight / total) * 100).toFixed(2)));
}

function measureMarkdownTableCell(cell) {
  const plain = String(cell)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\\\|/g, "|");
  const segments = plain.split(/\n+/).map((segment) => segment.trim()).filter(Boolean);
  const longest = segments.length ? Math.max(...segments.map(measureTextWidth)) : 0;
  return longest;
}

function measureTextWidth(text) {
  return Array.from(text).reduce((width, char) => {
    return width + (/[\u3000-\u9fff\u3040-\u30ff\uff00-\uffef]/.test(char) ? 2 : 1);
  }, 0);
}

function uniqueHeadingId(title, headingIds) {
  const base = slugifyHeading(title);
  const count = headingIds.get(base) || 0;
  headingIds.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function slugifyHeading(title) {
  const normalized = title
    .toLowerCase()
    .replace(/[`*_~()[\]{}<>:"'.,!?/\\|+=]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "section";
}

function renderToc(toc) {
  const links = toc.length
    ? toc.map((item) => `
        <button class="toc-link toc-level-${item.level}" data-doc-anchor="${escapeAttr(item.id)}" type="button">${escapeHtml(item.title)}</button>
      `).join("")
    : `<p>${escapeHtml(t("documents.noToc"))}</p>`;
  return `
    <p class="eyebrow">${t("documents.toc")}</p>
    <nav class="toc-list">
      ${links}
    </nav>
  `;
}

function bindDocumentToc() {
  document.querySelectorAll("[data-doc-anchor]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.docAnchor);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderInlineMarkdown(text) {
  const images = [];
  const withImageTokens = String(text).replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)(?:\{width=(\d{1,4})(%|px)?\})?/g,
    (_, alt, src, title, width, widthUnit) => {
      const token = `DOCIMGTOKEN${images.length}END`;
      images.push({ token, html: renderDocumentImage(src, alt, title, width, widthUnit) });
      return token;
    }
  );

  let html = escapeHtml(withImageTokens)
    .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const safeHref = href.startsWith("http") || href.startsWith("#") || href.startsWith("docs/") || href.startsWith("generated/")
        ? href
        : "#/documents";
      return `<a href="${escapeAttr(safeHref)}">${label}</a>`;
    });

  images.forEach((image) => {
    html = html.replace(image.token, image.html);
  });
  return html;
}

function isDocumentImageRow(text) {
  const imagePattern = /!\[[^\]]*\]\([^)\s]+(?:\s+["'][^"']*["'])?\)(?:\{width=\d{1,4}(?:%|px)?\})?/g;
  const images = String(text).match(imagePattern) || [];
  return images.length > 1 && String(text).replace(imagePattern, "").trim() === "";
}

function renderDocumentImage(src, alt = "", title = "", width = "", widthUnit = "") {
  const safeSrc = safeDocumentImageUrl(src);
  if (!safeSrc) return escapeHtml(alt);
  const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
  const safeWidth = normalizeDocumentImageWidth(width, widthUnit);
  const styleAttr = safeWidth ? ` style="width: ${safeWidth}"` : "";
  return `<img class="doc-image" src="${escapeAttr(safeSrc)}" alt="${escapeAttr(alt)}"${titleAttr}${styleAttr} loading="lazy" decoding="async">`;
}

function normalizeDocumentImageWidth(value, unit) {
  if (!value) return "";
  const width = Number(value);
  if (!Number.isFinite(width) || width <= 0) return "";
  if (unit === "%") return `${Math.min(100, Math.max(10, width))}%`;
  return `${Math.min(1600, Math.max(64, width))}px`;
}

function safeDocumentImageUrl(value) {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return safeExternalUrl(src);
  if (!/^(?:assets|docs)\//.test(src)) return "";
  if (src.includes("..") || src.includes("\\") || /[\u0000-\u001f\u007f]/.test(src)) return "";
  return src;
}

function renderNotFound() {
  appRoot.innerHTML = `
    <section class="route-panel">
      <div class="empty">
        <h1>${t("notFound.title")}</h1>
        <p>${t("notFound.lead")}</p>
        <a class="button" href="#/apps">${t("actions.backToApps")}</a>
      </div>
    </section>
  `;
}

function renderPagination(totalPages) {
  const buttons = totalPages <= 1 ? "" : Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="button ${page === state.page ? "" : "secondary"}" data-page="${page}" type="button">${page}</button>`;
  }).join("");
  const sizeOptions = PAGE_SIZE_OPTIONS
    .map((size) => option(String(size), String(size), String(state.pageSize)))
    .join("");
  const sizePicker = `
    <label class="page-size-picker">
      <span>${t("pagination.perPage")}</span>
      <select class="select" id="page-size-select">${sizeOptions}</select>
    </label>`;
  return `<div class="pagination">${buttons}${sizePicker}</div>`;
}

function renderActiveFilters() {
  const chips = [];
  if (state.query.trim()) chips.push(badge(state.query.trim(), "info"));
  state.categories.forEach((value) => chips.push(badge(labelFor("categories", value), "category")));
  state.permissions.forEach((value) => chips.push(badge(labelFor("permissions", value), "capability")));
  return chips.join("");
}

function checkbox(name, value, label, checked, count) {
  return `
    <label class="check-row">
      <input type="checkbox" name="${name}" value="${escapeAttr(value)}" ${checked ? "checked" : ""}>
      <span>${escapeHtml(label)}</span>
      ${count !== undefined ? `<span class="category-count">${count}</span>` : ""}
    </label>
  `;
}

function option(value, label, selected) {
  return `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function badge(text, type = "") {
  return `<span class="badge ${escapeAttr(type)}">${escapeHtml(text)}</span>`;
}

function meta(label, value, mono = false) {
  const content = mono ? `<code>${escapeHtml(value)}</code>` : `<strong>${escapeHtml(value)}</strong>`;
  return `<div class="meta-row"><span>${escapeHtml(label)}</span>${content}</div>`;
}

function metaExternalLink(label, value, href, mono = false) {
  if (!value) return "";
  const safeHref = safeExternalUrl(href);
  if (!safeHref) return meta(label, value, mono);
  const content = mono ? `<code>${escapeHtml(value)}</code>` : `<strong>${escapeHtml(value)}</strong>`;
  return `<div class="meta-row"><span>${escapeHtml(label)}</span><a href="${escapeAttr(safeHref)}" target="_blank" rel="noopener noreferrer">${content}</a></div>`;
}

function authorDisplayName(app) {
  const author = app.author || {};
  return author.display_name || author.name || author.github || "";
}

function authorGithubUrl(app) {
  const github = String(app.author?.github || "").trim();
  if (!github) return "";
  if (github.startsWith("http://") || github.startsWith("https://")) return safeExternalUrl(github);
  if (!/^[A-Za-z0-9-]+$/.test(github)) return "";
  return `https://github.com/${encodeURIComponent(github)}`;
}

function authorWebsiteUrl(app) {
  const author = app.author || {};
  return safeExternalUrl(author.website || author.url || author.homepage || "");
}

function safeExternalUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const href = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function urlDisplayText(value) {
  const safeHref = safeExternalUrl(value);
  if (!safeHref) return "";
  try {
    const url = new URL(safeHref);
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.hostname}${path}${url.search}`;
  } catch {
    return value;
  }
}

function renderPermissionDeclarations(app) {
  const noneRequired = APP_PERMISSIONS.every((permission) => app.permissions[permission] === false);
  return `${noneRequired ? `<p class="markdown-copy">${escapeHtml(t("detail.noRequirements"))}</p>` : ""}
    <dl class="permission-declarations">${APP_PERMISSIONS.map((permission) => {
      const value = app.permissions[permission];
      const status = typeof value === "boolean" ? t(`boolean.${value}`) : t("detail.undeclared");
      const statusClass = value === true ? "enabled" : value === false ? "disabled" : "undeclared";
      return `<div class="permission-declaration"><dt>${escapeHtml(labelFor("permissionStatements", permission))}</dt><dd><span class="permission-status ${statusClass}">${escapeHtml(status)}</span></dd></div>`;
    }).join("")}</dl>`;
}

function declaredPermissions(app) {
  return APP_PERMISSIONS.filter((permission) => hasPermission(app, permission));
}

function hasPermission(app, permission) {
  return app.permissions[permission] === true;
}

function localized(app, field) {
  const sources = [app.locales, app.i18n];
  const candidates = [...new Set([state.locale, state.locale.split("-")[0], "en"])];
  for (const locale of candidates) {
    for (const source of sources) {
      const value = source?.[locale]?.[field];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return app[field] || "";
}

function labelFor(group, value) {
  return getPath(state.dict, `${group}.${value}`) || value;
}

function t(key, params = {}) {
  const value = getPath(state.dict, key) ?? key;
  if (typeof value !== "string") return value;
  return Object.entries(params).reduce((text, [name, replacement]) => {
    return text.replaceAll(`{${name}}`, replacement);
  }, value);
}

function getPath(source, path) {
  return path.split(".").reduce((cursor, part) => cursor?.[part], source);
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(state.locale, { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(state.locale, {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date);
}

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateTimeValue(value) {
  return parseDate(value)?.getTime() || 0;
}

function bindCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = t("actions.copied");
      setTimeout(() => {
        button.textContent = t("actions.copy");
      }, 1200);
    });
  });

  document.querySelectorAll("[data-code-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".code-block-wrap")?.querySelector("code")?.textContent || "";
      await navigator.clipboard.writeText(code);
      button.textContent = t("actions.copied");
      setTimeout(() => {
        button.textContent = t("actions.copy");
      }, 1200);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
