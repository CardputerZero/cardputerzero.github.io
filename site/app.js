const REGISTRY_URL = "generated/registry.json";
// The app grid renders 3 columns, so page sizes are multiples of 3 to keep
// full rows. The user's choice persists in localStorage.
const DEFAULT_PAGE_SIZE = 30;
const PAGE_SIZE_OPTIONS = [6, 12, 18, 30, 60, 90];
const PAGE_SIZE_STORAGE_KEY = "cz_apps_page_size";

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
  source: "",
  externalHardware: "",
  service: "",
  hdmi: "",
  commercial: "",
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
  const registryGeneratedAt = state.registry?.generated_at || "";
  const publishedAt = app.published_at || app.updated_at || registryGeneratedAt;
  const updatedAt = app.updated_at || app.published_at || registryGeneratedAt;
  const source = app.source || {
    openness: app.source_openness || "unknown",
    repository: app.source_repo || ""
  };
  const review = app.review || {
    status: app.review_status || "approved"
  };
  const author = app.author && typeof app.author === "object" ? app.author : {};
  const appMeta = app.app || {};
  return {
    ...app,
    categories: app.categories || [],
    author,
    locales: app.locales || app.i18n || {},
    published_at: publishedAt,
    updated_at: updatedAt,
    source,
    review,
    download: app.download || {},
    permissions: app.permissions || {},
    privacy: app.privacy || {},
    risk_flags: app.risk_flags || [],
    assets: app.assets || {
      icon: app.icon || "",
      screenshots: app.screenshots || []
    },
    app: {
      service: Boolean(appMeta.service),
      dependencies: appMeta.dependencies || (app.depends ? [app.depends] : []),
      external_hardware: appMeta.external_hardware || { required: false, items: [] },
      hdmi_output: Boolean(appMeta.hdmi_output),
      commercial_use: appMeta.commercial_use || "allowed",
      applaunch: appMeta.applaunch || {}
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
    renderRegistry();
  } else if (route.name === "apps") {
    renderAppsPage();
  } else {
    renderHome();
  }

  appRoot.insertAdjacentHTML("afterbegin", renderWipBanner());
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
    item.classList.toggle("active", item.dataset.nav === activeName);
  });
}

function renderHome() {
  const approved = state.apps.filter((app) => app.review.status === "approved" || app.review.status === "ci-passed");
  const featured = state.apps
    .filter((app) => app.featured)
    .concat(approved)
    .filter(uniqueByUuid)
    .slice(0, 6);

  appRoot.innerHTML = `
    <section class="route-panel">
      <div class="home-grid">
        <section class="hero hero-banner">
          <div class="hero-banner-media" aria-hidden="true">
            <img class="hero-banner-image" src="assets/banner.jpg?v=20260601" alt="">
          </div>
          <div class="hero-banner-overlay">
            <div class="hero-cta-grid">
              <div class="hero-cta hero-cta-developers">
                <a class="hero-cta-button hero-cta-button-developers" href="#/documents">${t("home.developersCta")}</a>
                <p class="hero-cta-desc">${t("home.developersLead")}</p>
              </div>
              <div class="hero-cta hero-cta-users">
                <a class="hero-cta-button hero-cta-button-users" href="#/apps">${t("home.usersCta")}</a>
                <p class="hero-cta-desc">${t("home.usersLead")}</p>
              </div>
            </div>
          </div>
        </section>
        ${renderRegistryPanel()}
      </div>
      <section>
        <div class="section-head">
          <div>
            <h2>${t("home.featured")}</h2>
            <p>${t("home.featuredLead")}</p>
          </div>
          <a class="button secondary" href="#/apps">${t("actions.viewAll")}</a>
        </div>
        <div class="app-grid">${featured.map(renderAppCard).join("")}</div>
      </section>
    </section>
  `;

}

function renderRegistryPanel() {
  const registry = state.registry;
  const approvedCount = state.apps.filter((app) => app.review.status === "approved").length;
  const riskCount = state.apps.filter((app) => app.risk_flags.length > 0).length;

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
          <span class="status-label">${t("registry.approved")}</span>
          <span class="status-value">${approvedCount}</span>
        </div>
        <div class="status-item">
          <span class="status-label">${t("registry.risk")}</span>
          <span class="status-value">${riskCount}</span>
        </div>
        <div class="status-item">
          <span class="status-label">${t("registry.updated")}</span>
          <span class="status-value">${formatDate(registry.generated_at)}</span>
        </div>
        <div class="status-item">
          <span class="status-label">${t("registry.loaded")}</span>
          <span class="status-value">${formatDateTime(APP_LOADED_AT)}</span>
        </div>
        <div class="status-item">
          <span class="status-label">${t("registry.schema")}</span>
          <span class="status-value">v${registry.schema_version}</span>
        </div>
      </div>
      <a class="button" href="#/registry">${t("registry.open")}</a>
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
    <section class="route-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("apps.eyebrow")}</p>
          <h1>${t("apps.title")}</h1>
          <p class="lead">${t("apps.lead")}</p>
        </div>
      </div>
      <div class="list-layout">
        ${renderFilters()}
        <section>
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
                ${option("review", t("sort.review"), state.sort)}
              </select>
            </div>
          </div>
          ${pageApps.length ? `<div class="app-grid">${pageApps.map(renderAppCard).join("")}</div>` : `<div class="empty">${t("apps.empty")}</div>`}
          ${renderPagination(totalPages)}
        </section>
      </div>
    </section>
  `;

  bindFilterEvents();
}

function renderFilters() {
  const categories = [...new Set(state.apps.flatMap((app) => app.categories))].sort();
  const permissions = ["network", "filesystem", "microphone", "audio_output", "external_hardware", "background_service", "keyboard_input"];

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
        ${categories.map((category) => checkbox("category", category, labelFor("categories", category), state.categories.has(category))).join("")}
      </div>
      <div class="filter-group">
        <span class="filter-group-title">${t("filters.permissions")}</span>
        ${permissions.map((permission) => checkbox("permission", permission, labelFor("permissions", permission), state.permissions.has(permission))).join("")}
      </div>
      <div class="filter-group">
        <label class="filter-group-title" for="source-filter">${t("filters.source")}</label>
        <select class="select" id="source-filter">
          ${option("", t("filters.any"), state.source)}
          ${["open-source", "source-available", "closed-source", "binary-only", "mixed"].map((value) => option(value, labelFor("source", value), state.source)).join("")}
        </select>
      </div>
      ${triStateSelect("external-hardware-filter", "externalHardware", t("filters.externalHardware"))}
      ${triStateSelect("service-filter", "service", t("filters.service"))}
      ${triStateSelect("hdmi-filter", "hdmi", t("filters.hdmi"))}
      ${commercialSelect("commercial-filter", "commercial", t("filters.commercial"))}
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

  document.querySelector("#source-filter").addEventListener("change", (event) => {
    state.source = event.target.value;
    state.page = 1;
    renderAppsPage();
  });

  [
    ["external-hardware-filter", "externalHardware"],
    ["service-filter", "service"],
    ["hdmi-filter", "hdmi"],
    ["commercial-filter", "commercial"]
  ].forEach(([id, key]) => {
    document.querySelector(`#${id}`).addEventListener("change", (event) => {
      state[key] = event.target.value;
      state.page = 1;
      renderAppsPage();
    });
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
    state.source = "";
    state.externalHardware = "";
    state.service = "";
    state.hdmi = "";
    state.commercial = "";
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
  return state.apps
    .filter((app) => {
      const text = [
        app.uuid,
        app.share_code,
        app.author.github,
        app.author.display_name,
        app.author.website,
        app.categories.join(" "),
        app.source.openness,
        localized(app, "title"),
        localized(app, "summary"),
        localized(app, "description")
      ].join(" ").toLowerCase();
      if (query && !text.includes(query)) return false;
      if (state.categories.size && !app.categories.some((category) => state.categories.has(category))) return false;
      if (state.permissions.size && ![...state.permissions].every((permission) => hasPermission(app, permission))) return false;
      if (state.source && app.source.openness !== state.source) return false;
      if (state.externalHardware && boolString(app.app.external_hardware.required) !== state.externalHardware) return false;
      if (state.service && boolString(app.app.service) !== state.service) return false;
      if (state.hdmi && boolString(app.app.hdmi_output) !== state.hdmi) return false;
      if (state.commercial && app.app.commercial_use !== state.commercial) return false;
      return true;
    })
    .sort(sortApps);
}

function sortApps(a, b) {
  if (state.sort === "published") return dateTimeValue(b.published_at) - dateTimeValue(a.published_at);
  if (state.sort === "name") return localized(a, "title").localeCompare(localized(b, "title"), state.locale);
  if (state.sort === "review") return a.review.status.localeCompare(b.review.status);
  return dateTimeValue(b.updated_at) - dateTimeValue(a.updated_at);
}

function renderAppCard(app) {
  const categoryBadges = app.categories.slice(0, 2).map((category) => badge(labelFor("categories", category), "info")).join("");
  const permissionBadges = sensitivePermissions(app).slice(0, 2).map((permission) => badge(labelFor("permissions", permission), "warning")).join("");
  const extra = Math.max(0, sensitivePermissions(app).length - 2);
  return `
    <article class="app-card">
      <a class="app-card-link" href="#/apps/${app.uuid}">
        <div class="app-card-head">
          <img class="app-icon" src="${escapeAttr(app.assets.icon)}" alt="${escapeAttr(localized(app, "title"))}">
          <div class="app-title-block">
            <h3>${escapeHtml(localized(app, "title"))}</h3>
            <p class="app-author">@${escapeHtml(app.author.github)}</p>
          </div>
          <code class="share-code">${escapeHtml(app.share_code)}</code>
        </div>
        <p class="app-summary">${escapeHtml(localized(app, "summary"))}</p>
        <div class="badge-row app-categories">${categoryBadges}</div>
        <div class="badge-row app-signals">
          ${badge(labelFor("review", app.review.status), app.review.status)}
          ${badge(labelFor("source", app.source.openness), app.source.openness)}
          ${permissionBadges}
          ${extra ? badge(`+${extra}`, "warning") : ""}
        </div>
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
    ? app.assets.screenshots.map((src) => `<img class="screenshot" src="${escapeAttr(src)}" alt="${escapeAttr(localized(app, "title"))} screenshot">`).join("")
    : `<img class="screenshot" src="${escapeAttr(app.assets.icon)}" alt="${escapeAttr(localized(app, "title"))} icon">`;

  appRoot.innerHTML = `
    <section class="route-panel">
      <a class="button secondary" href="#/apps">${t("actions.backToApps")}</a>
      <div class="detail-layout">
        <article class="section-panel detail-main">
          <div class="detail-hero">
            <img class="detail-icon" src="${escapeAttr(app.assets.icon)}" alt="${escapeAttr(localized(app, "title"))}">
            <div>
              <p class="eyebrow">${app.categories.map((category) => labelFor("categories", category)).join(" / ")}</p>
              <h1>${escapeHtml(localized(app, "title"))}</h1>
              <p class="detail-summary">${escapeHtml(localized(app, "summary"))}</p>
            </div>
          </div>
          <section class="detail-section">
            <h2>${t("detail.about")}</h2>
            <p class="markdown-copy">${escapeHtml(localized(app, "description"))}</p>
          </section>
          <section class="detail-section">
            <h2>${t("detail.screenshots")}</h2>
            <div class="screenshots">${screenshots}</div>
          </section>
          <section class="detail-section">
            <h2>${t("detail.permissions")}</h2>
            <div class="badge-row">
              ${allPermissionBadges(app)}
            </div>
          </section>
          <section class="detail-section">
            <h2>${t("detail.risks")}</h2>
            ${app.risk_flags.length ? `<div class="badge-row">${app.risk_flags.map((risk) => badge(labelFor("risks", risk), "warning")).join("")}</div>` : `<p class="markdown-copy">${t("detail.noRisks")}</p>`}
          </section>
        </article>
        <aside class="detail-aside">
          <h2>${t("detail.install")}</h2>
          <p class="markdown-copy">${t("detail.installLead")}</p>
          <div class="copy-row">
            <code>${escapeHtml(app.share_code)}</code>
            <button class="button secondary" data-copy="${escapeAttr(app.share_code)}" type="button">${t("actions.copy")}</button>
          </div>
          <div class="meta-list">
            ${metaExternalLink(t("fields.author"), authorDisplayName(app), authorGithubUrl(app))}
            ${authorWebsiteUrl(app) ? metaExternalLink(t("fields.website"), urlDisplayText(authorWebsiteUrl(app)), authorWebsiteUrl(app), true) : ""}
            ${meta(t("fields.status"), labelFor("review", app.review.status))}
            ${meta(t("fields.version"), app.version)}
            ${meta(t("fields.updated"), formatDate(app.updated_at))}
            ${meta(t("fields.source"), labelFor("source", app.source.openness))}
            ${meta(t("fields.license"), app.license)}
            ${meta(t("fields.checksum"), checksumText(app), true)}
            ${meta(t("fields.download"), app.download.url, true)}
            ${meta(t("fields.uuid"), app.uuid, true)}
          </div>
          <div class="badge-row">
            ${badge(labelFor("review", app.review.status), app.review.status)}
            ${badge(labelFor("source", app.source.openness), app.source.openness)}
            ${app.app.external_hardware.required ? badge(t("flags.externalHardware"), "warning") : ""}
            ${app.app.service ? badge(t("flags.service"), "warning") : ""}
            ${app.app.hdmi_output ? badge(t("flags.hdmi"), "info") : ""}
          </div>
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

function checksumText(app) {
  if (app.download?.md5) return `md5:${app.download.md5}`;
  if (app.download?.sha256) return `sha256:${app.download.sha256}`;
  return "-";
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
    <section class="route-panel">
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
        ${DOCUMENTS.map(renderDocumentCard).join("")}
      </section>
    </section>
  `;
}

function renderDocumentCard(doc) {
  return `
    <article class="document-card">
      <a href="#/documents/${escapeAttr(doc.slug)}">
        <h2>${escapeHtml(t(doc.titleKey))}</h2>
        <p>${escapeHtml(t(doc.summaryKey))}</p>
      </a>
    </article>
  `;
}

async function renderDocument(slug) {
  const doc = DOCUMENTS.find((item) => item.slug === slug);
  if (!doc) {
    renderNotFound();
    appRoot.insertAdjacentHTML("afterbegin", renderWipBanner());
    return;
  }

  appRoot.innerHTML = `
    <section class="route-panel">
      ${renderWipBanner()}
      <div class="section-head compact">
        <div>
          <p class="eyebrow">${t("documents.eyebrow")}</p>
          <h1>${escapeHtml(t(doc.titleKey))}</h1>
          <p class="lead">${escapeHtml(t(doc.summaryKey))}</p>
        </div>
        <a class="button secondary" href="#/documents">${t("documents.back")}</a>
      </div>
      <div class="document-layout">
        <aside class="doc-toc" aria-label="${escapeAttr(t("documents.toc"))}">
          <p class="eyebrow">${t("documents.toc")}</p>
          <p>${t("documents.loading")}</p>
        </aside>
        <section class="section-panel markdown-doc" aria-live="polite">
          <p>${t("documents.loading")}</p>
        </section>
      </div>
    </section>
  `;

  try {
    const markdown = await loadMarkdown(documentPath(doc));
    const rendered = renderMarkdown(markdown);
    const docNode = document.querySelector(".markdown-doc");
    const tocNode = document.querySelector(".doc-toc");
    if (docNode) docNode.innerHTML = rendered.html;
    if (tocNode) tocNode.innerHTML = renderToc(rendered.toc);
    bindDocumentToc();
  } catch (error) {
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

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre class="code-block"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = false;
        codeLines = [];
      } else {
        flushParagraph();
        flushList();
        inCode = true;
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
  if (inCode) html.push(`<pre class="code-block"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  return { html: html.join("\n"), toc };
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

function renderRegistry() {
  const registryText = JSON.stringify(state.registry, null, 2);
  appRoot.innerHTML = `
    <section class="route-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("registry.eyebrow")}</p>
          <h1>${t("registry.pageTitle")}</h1>
          <p class="lead">${t("registry.pageLead")}</p>
        </div>
      </div>
      ${renderRegistryPanel()}
      <section class="section-panel">
        <div class="section-head">
          <h2>${t("registry.files")}</h2>
        </div>
        <div class="badge-row">
          <a class="button secondary" href="generated/registry.json">registry.json</a>
        </div>
      </section>
      <pre class="registry-preview">${escapeHtml(registryText)}</pre>
    </section>
  `;
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
  state.categories.forEach((value) => chips.push(badge(labelFor("categories", value), "info")));
  state.permissions.forEach((value) => chips.push(badge(labelFor("permissions", value), "warning")));
  if (state.source) chips.push(badge(labelFor("source", state.source), "info"));
  if (state.externalHardware) chips.push(badge(`${t("filters.externalHardware")}: ${labelFor("boolean", state.externalHardware)}`, "warning"));
  if (state.service) chips.push(badge(`${t("filters.service")}: ${labelFor("boolean", state.service)}`, "warning"));
  if (state.hdmi) chips.push(badge(`${t("filters.hdmi")}: ${labelFor("boolean", state.hdmi)}`, "info"));
  if (state.commercial) chips.push(badge(`${t("filters.commercial")}: ${labelFor("commercial", state.commercial)}`, "info"));
  return chips.join("");
}

function triStateSelect(id, key, label) {
  return `
    <div class="filter-group">
      <label class="filter-group-title" for="${id}">${label}</label>
      <select class="select" id="${id}">
        ${option("", t("filters.any"), state[key])}
        ${option("true", t("boolean.true"), state[key])}
        ${option("false", t("boolean.false"), state[key])}
      </select>
    </div>
  `;
}

function commercialSelect(id, key, label) {
  return `
    <div class="filter-group">
      <label class="filter-group-title" for="${id}">${label}</label>
      <select class="select" id="${id}">
        ${option("", t("filters.any"), state[key])}
        ${option("allowed", labelFor("commercial", "allowed"), state[key])}
        ${option("restricted", labelFor("commercial", "restricted"), state[key])}
      </select>
    </div>
  `;
}

function checkbox(name, value, label, checked) {
  return `
    <label class="check-row">
      <input type="checkbox" name="${name}" value="${escapeAttr(value)}" ${checked ? "checked" : ""}>
      <span>${escapeHtml(label)}</span>
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

function allPermissionBadges(app) {
  const permissions = [
    "camera",
    "microphone",
    "audio_output",
    "sensors",
    "gps",
    "network",
    "filesystem",
    "keyboard_input",
    "external_hardware",
    "background_service"
  ];
  return permissions
    .filter((permission) => hasPermission(app, permission))
    .map((permission) => badge(labelFor("permissions", permission), sensitivePermissions(app).includes(permission) ? "warning" : "info"))
    .join("") || badge(t("detail.noSensitivePermissions"), "approved");
}

function sensitivePermissions(app) {
  return ["network", "filesystem", "camera", "microphone", "sensors", "gps", "external_hardware", "background_service"]
    .filter((permission) => hasPermission(app, permission));
}

function hasPermission(app, permission) {
  if (permission === "filesystem") return app.permissions.filesystem && app.permissions.filesystem !== "none";
  if (permission === "external_hardware") return app.app.external_hardware.required;
  if (permission === "background_service") return app.app.service;
  return Boolean(app.permissions[permission]);
}

function boolString(value) {
  return value ? "true" : "false";
}

function uniqueByUuid(app, index, list) {
  return list.findIndex((item) => item.uuid === app.uuid) === index;
}

function localized(app, field) {
  const sources = [app.i18n, app.locales].filter((source) => source && typeof source === "object");
  const candidates = localeCandidates();
  for (const source of sources) {
    for (const locale of candidates) {
      const value = source?.[locale]?.[field];
      if (value) return value;
    }
  }
  return app[field] || "";
}

function localeCandidates() {
  const base = state.locale.split("-")[0];
  return [...new Set([state.locale, base, "en", "zh-CN"])];
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
