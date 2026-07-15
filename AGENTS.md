# AGENTS.md

## Cursor Cloud specific instructions

This repo is the static GitHub Pages site for the **CardputerZero AppStore Hub** (app catalog web UI + generated registry JSON), a bundled **VitePress developer docs** site, and a browser-based **WASM emulator**. There is no backend, database, or Docker in this repo. See `README.md` and `developer-docs/dev/repositories.md` for the broader ecosystem (device OS, packages repo, on-device store) which lives in other repos.

### Services and how to run them (dev mode)

- **Hub SPA + emulator (main product):** vanilla HTML/CSS/JS served statically from the repo root. Run `python3 -m http.server 4173` from `/workspace`, then open `http://localhost:4173/`. Note: README says `cd hub` first, but in this checkout the site root is the repo root (`index.html` is at the top level) — do NOT `cd hub`, there is no `hub/` dir.
  - App catalog: `http://localhost:4173/#/apps` (loads `generated/registry.json`, currently 25 apps).
  - Emulator: `http://localhost:4173/emulator/`.
  - Must be served over HTTP (not `file://`) because the SPA uses `fetch()` for the registry and Markdown docs.
- **VitePress developer docs:** npm project under `developer-docs/`. Run `npm run dev` (default port 5173, browse at `http://localhost:5173/docs/` because `base: '/docs/'`). `npm run build` outputs to `developer-docs/.vitepress/dist/`; the committed production build lives in top-level `docs/`.

### Lint / test / build

- No linter, no automated test suite, and no root package manager in this repo.
- The only CI build check is VitePress: `.github/workflows/docs-check.yml` runs `npm install` + `npm run build` inside `developer-docs/` (Node 20 in CI; the VM has a newer Node which also works).
- `scripts/generate_registry.py` regenerates `generated/registry.json` from upstream Debian package metadata. It uses only the Python standard library (no pip deps) but needs network access to `CardputerZero/packages`; it is a maintainer/CI task, not needed for local browsing.
