# CardputerZero AppStore Hub

This directory contains the static GitHub Pages site for the CardputerZero AppStore registry, documentation center, and web UI. The registry is generated from `CardputerZero/packages` package metadata.

## Local Preview

Run a static server from this directory:

```bash
cd hub
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

The page uses `fetch()` to load `generated/registry.json`, so serving it over HTTP is recommended instead of opening `index.html` directly from the filesystem.

## GitHub Pages

Publish the `hub/` directory as the Pages root. The entry point is:

```text
hub/index.html
```

Static data files:

- `generated/registry.json`
- `generated/registry-index.json` compatibility alias for older AppStore clients

Static UI files:

- `site/app.js`
- `site/styles.css`
- `site/i18n/zh-CN.json`
- `site/i18n/en.json`
- `site/i18n/ja.json`

Test assets copied from local APPLaunch apps live under `assets/`.

Developer publishing docs cover the current `czdev publish` flow:

- `docs/app-submission-guide.md`
- `docs/zh-CN/app-submission-guide.md`
- `docs/ja/app-submission-guide.md`
