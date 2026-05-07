const REGISTRY_URL = "generated/registry.json";
const PAGE_SIZE = 6;
const SUPPORTED_LOCALES = ["zh-CN", "en", "ja"];

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
  filtersOpen: false,
  filterTimer: null,
  searchComposing: false,
  restoreQueryFocus: false,
  querySelectionStart: null,
  querySelectionEnd: null
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
    render();
  });

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  try {
    const [registry, dict] = await Promise.all([
      fetchJson(REGISTRY_URL),
      loadLocale(state.locale)
    ]);
    state.registry = registry;
    state.apps = registry.apps;
    state.dict = dict;
    document.documentElement.lang = state.locale;
    render();
  } catch (error) {
    appRoot.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load ${url}: ${response.status}`);
  }
  return response.json();
}

async function loadLocale(locale) {
  const response = await fetch(`site/i18n/${locale}.json`);
  if (!response.ok) {
    return fetchJson("site/i18n/zh-CN.json");
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
  } else if (route.name === "submit") {
    renderSubmit();
  } else if (route.name === "policy") {
    renderPolicy();
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
  if (parts[0] === "submit") return { name: "submit" };
  if (parts[0] === "policy") return { name: "policy" };
  if (parts[0] === "registry") return { name: "registry" };
  return { name: "home" };
}

function updateNav(routeName) {
  document.querySelectorAll("[data-nav]").forEach((item) => {
    item.classList.toggle("active", item.dataset.nav === routeName);
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
        <section class="hero">
          <div>
            <p class="eyebrow">${t("home.eyebrow")}</p>
            <h1>${t("home.title")}</h1>
            <p class="hero-subtitle">${t("home.subtitle")}</p>
            <p class="lead">${t("home.lead")}</p>
          </div>
          <form class="search-row" id="home-search">
            <label class="visually-hidden" for="home-query">${t("search.label")}</label>
            <input class="input" id="home-query" name="query" type="search" autocomplete="off" placeholder="${t("search.placeholder")}" value="${escapeAttr(state.query)}">
            <button class="button" type="submit">${t("actions.search")}</button>
          </form>
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

  document.querySelector("#home-search").addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = new FormData(event.currentTarget).get("query").trim();
    state.page = 1;
    location.hash = "#/apps";
  });
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
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const offset = (state.page - 1) * PAGE_SIZE;
  const pageApps = filtered.slice(offset, offset + PAGE_SIZE);

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
  if (state.sort === "published") return new Date(b.published_at) - new Date(a.published_at);
  if (state.sort === "name") return localized(a, "title").localeCompare(localized(b, "title"), state.locale);
  if (state.sort === "review") return a.review.status.localeCompare(b.review.status);
  return new Date(b.updated_at) - new Date(a.updated_at);
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
            ${meta(t("fields.status"), labelFor("review", app.review.status))}
            ${meta(t("fields.version"), app.version)}
            ${meta(t("fields.updated"), formatDate(app.updated_at))}
            ${meta(t("fields.source"), labelFor("source", app.source.openness))}
            ${meta(t("fields.license"), app.license)}
            ${meta(t("fields.checksum"), app.download.sha256, true)}
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
    </section>
  `;

  bindCopyButtons();
}

function renderSubmit() {
  appRoot.innerHTML = `
    <section class="route-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("submit.eyebrow")}</p>
          <h1>${t("submit.title")}</h1>
          <p class="lead">${t("submit.lead")}</p>
        </div>
      </div>
      <section class="notice-panel">
        <div>
          <p class="eyebrow">${t("submit.agreementEyebrow")}</p>
          <h2>${t("submit.agreementTitle")}</h2>
          <p>${t("submit.agreementLead")}</p>
        </div>
        <div class="notice-actions">
          <a class="button" href="#/policy">${t("submit.readAgreement")}</a>
          <a class="button secondary" href="docs/developer-submission-policy.md">${t("submit.openPolicyDoc")}</a>
        </div>
      </section>
      <section class="section-panel">
        <div class="section-head">
          <div>
            <h2>${t("submit.flowTitle")}</h2>
            <p>${t("submit.flowLead")}</p>
          </div>
        </div>
        <ol class="submit-flow">
          ${t("submit.steps").map((step) => renderSubmitStep(step)).join("")}
        </ol>
      </section>
      <div class="two-column">
        <section class="submit-band">
          <h2>${t("submit.structureTitle")}</h2>
          <p>${t("submit.structureLead")}</p>
          <pre class="code-block">${escapeHtml(t("submit.directoryExample"))}</pre>
        </section>
        <section class="submit-band">
          <h2>${t("submit.formatTitle")}</h2>
          <p>${t("submit.formatLead")}</p>
          <pre class="code-block">${escapeHtml(t("submit.metadataExample"))}</pre>
        </section>
      </div>
      <div class="submit-grid">
        ${renderSubmitBand("submit.metadataTitle", "submit.metadata")}
        ${renderSubmitBand("submit.ciTitle", "submit.ci")}
        ${renderSubmitBand("submit.reviewTitle", "submit.review")}
      </div>
    </section>
  `;
}

function renderSubmitStep(step) {
  return `
    <li class="flow-step">
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.body)}</p>
    </li>
  `;
}

function renderSubmitBand(titleKey, listKey) {
  return `
    <section class="submit-band">
      <h2>${t(titleKey)}</h2>
      <ul>${t(listKey).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function renderPolicy() {
  appRoot.innerHTML = `
    <section class="route-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("policy.eyebrow")}</p>
          <h1>${t("policy.title")}</h1>
          <p class="lead">${t("policy.lead")}</p>
        </div>
      </div>
      <section class="notice-panel">
        <div>
          <p class="eyebrow">${t("policy.agreementEyebrow")}</p>
          <h2>${t("policy.agreementTitle")}</h2>
          <p>${t("policy.agreementLead")}</p>
        </div>
        <div class="notice-actions">
          <a class="button" href="#/submit">${t("policy.submitLink")}</a>
          <a class="button secondary" href="docs/developer-submission-policy.md">${t("policy.fullDoc")}</a>
        </div>
      </section>
      <section class="section-panel">
        <div class="section-head">
          <div>
            <h2>${t("policy.summaryTitle")}</h2>
            <p>${t("policy.summaryLead")}</p>
          </div>
        </div>
        <div class="agreement-grid">
          ${t("policy.sections").map((section) => renderAgreementSection(section)).join("")}
        </div>
      </section>
      <section class="section-panel">
        <h2>${t("policy.acceptanceTitle")}</h2>
        <p class="markdown-copy">${t("policy.acceptanceText")}</p>
      </section>
    </section>
  `;
}

function renderAgreementSection(section) {
  return `
    <article class="agreement-section">
      <h3>${escapeHtml(section.title)}</h3>
      <ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
  `;
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
          <a class="button secondary" href="generated/registry.yml">registry.yml</a>
          <a class="button secondary" href="generated/registry-index.json">registry-index.json</a>
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
  if (totalPages <= 1) return "";
  const buttons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="button ${page === state.page ? "" : "secondary"}" data-page="${page}" type="button">${page}</button>`;
  }).join("");
  return `<div class="pagination">${buttons}</div>`;
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
  const localeData = app.locales?.[state.locale] || app.locales?.["zh-CN"] || app.locales?.en || {};
  return localeData[field] || app[field] || "";
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
  return new Intl.DateTimeFormat(state.locale, { dateStyle: "medium" }).format(new Date(value));
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
