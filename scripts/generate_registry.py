#!/usr/bin/env python3
"""Generate CardputerZero AppStore registry files from Debian Packages metadata."""

from __future__ import annotations

import argparse
import copy
import datetime as dt
import json
import re
import uuid
from pathlib import Path
from typing import Any
from urllib.parse import quote


NAMESPACE_CZ = uuid.UUID("c4d70000-a770-4000-8000-000000000000")
RAW_PACKAGE_BASE = "https://raw.githubusercontent.com/CardputerZero/packages/main/pool/main"
SUPPORTED_LOCALES = ["zh-CN", "en", "ja"]


def now_iso() -> str:
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S+08:00")


def make_uuid(pkg_name: str, sha256_hex: str) -> str:
    return str(uuid.uuid5(NAMESPACE_CZ, f"{pkg_name}:{sha256_hex}"))


def parse_packages(path: Path) -> dict[str, dict[str, str]]:
    packages: dict[str, dict[str, str]] = {}
    current: dict[str, str] = {}
    current_key = ""

    def commit() -> None:
        if "Package" not in current:
            return
        pkg = current["Package"]
        if pkg not in packages or current.get("Version", "") > packages[pkg].get("Version", ""):
            packages[pkg] = dict(current)

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        if not raw_line:
            commit()
            current = {}
            current_key = ""
            continue
        if raw_line.startswith(" ") and current_key:
            current[current_key] = current[current_key] + "\n" + raw_line[1:]
            continue
        if ": " in raw_line:
            current_key, value = raw_line.split(": ", 1)
            current[current_key] = value
    commit()
    return packages


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    merged = copy.deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = deep_merge(merged[key], value)
        else:
            merged[key] = copy.deepcopy(value)
    return merged


def list_value(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if str(item)]
    if isinstance(value, str) and value:
        return [value]
    return []


def resolve_asset_ref(pkg_name: str, ref: str, kind: str) -> str:
    """Map a meta.json asset reference onto the pool directory layout.

    czdev copies store assets into pool/main/<pkg>/ with a flat, normalized
    layout — the icon at <pkg-dir>/<basename> and screenshots under
    <pkg-dir>/screenshots/<basename> — but meta.json keeps the *source repo*
    relative paths (e.g. "share/images/foo.png", "packaging/icon.png",
    "store/screenshots/a.png"), which do not exist under pool/. Resolving by
    basename against the pool layout is therefore the reliable rule.
    Absolute URLs and site-local "assets/" refs (used by overrides) pass
    through untouched.
    """
    if not ref:
        return ""
    if ref.startswith(("http://", "https://")):
        return ref
    # Site-local refs (used by registry-overrides.json) pass through, but only
    # when the file actually exists in this repo — meta.json source paths can
    # coincidentally start with "assets/" too (e.g. "assets/images/foo.png").
    if ref.startswith("assets/") and Path(ref).exists():
        return ref
    basename = quote(ref.rstrip("/").rsplit("/", 1)[-1])
    if kind == "icon":
        return f"{RAW_PACKAGE_BASE}/{pkg_name}/{basename}"
    return f"{RAW_PACKAGE_BASE}/{pkg_name}/screenshots/{basename}"


def normalize_assets(pkg_name: str, meta: dict[str, Any]) -> dict[str, Any]:
    assets = meta.get("assets") if isinstance(meta.get("assets"), dict) else {}
    icon = str(assets.get("icon") or meta.get("icon") or "")
    screenshots = list_value(assets.get("screenshots") or meta.get("screenshots"))
    return {
        "icon": resolve_asset_ref(pkg_name, icon, "icon"),
        "screenshots": [resolve_asset_ref(pkg_name, item, "screenshot") for item in screenshots],
    }


MAINTAINER_RE = re.compile(r"^\s*(.*?)\s*<([^>]+)>\s*$")
NOREPLY_RE = re.compile(r"^(?:\d+\+)?([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)@users\.noreply\.github\.com$", re.IGNORECASE)


def author_from_maintainer(maintainer: str) -> dict[str, str]:
    """Derive an author object from the APT Maintainer field.

    czdev-generated meta.json has no author section, but the package's
    Maintainer field ("Name <email>") is validated against the submitter's
    GitHub identity, so it is a trustworthy source. GitHub noreply addresses
    also yield the login.
    """
    match = MAINTAINER_RE.match(maintainer or "")
    if not match:
        return {}
    display_name, email = match.group(1).strip(), match.group(2).strip()
    author: dict[str, str] = {}
    noreply = NOREPLY_RE.match(email)
    if noreply:
        author["github"] = noreply.group(1)
    if display_name:
        author["display_name"] = display_name
    elif noreply:
        author["display_name"] = noreply.group(1)
    return author


def build_app(pkg_name: str, pkg_info: dict[str, str], meta: dict[str, Any], generated_at: str) -> dict[str, Any]:
    sha256 = pkg_info.get("SHA256", "")
    filename = pkg_info.get("Filename", "")
    # Filename may be an absolute URL (the .deb is served from a GitHub Release)
    # or a legacy in-repo path. Use absolute URLs verbatim; otherwise resolve
    # against the packages repo's raw content.
    if filename.startswith(("http://", "https://")):
        download_url = filename
    else:
        download_url = f"https://github.com/CardputerZero/packages/raw/main/{filename}"
    assets = normalize_assets(pkg_name, meta)
    locales = meta.get("locales") if isinstance(meta.get("locales"), dict) else {}
    i18n = meta.get("i18n") if isinstance(meta.get("i18n"), dict) else {}
    if not locales and i18n:
        locales = i18n
    if not i18n and locales:
        i18n = locales
    published_at = str(meta.get("published_at") or meta.get("created_at") or generated_at)
    updated_at = str(meta.get("updated_at") or meta.get("published_at") or meta.get("created_at") or generated_at)
    review = meta.get("review") if isinstance(meta.get("review"), dict) else {}
    review_status = str(meta.get("review_status") or review.get("status") or "approved")
    review = {**review, "status": review_status}

    app = {
        "uuid": str(meta.get("uuid") or make_uuid(pkg_name, sha256)),
        "share_code": str(meta.get("share_code") or pkg_name[:4]),
        "title": str(meta.get("title") or pkg_name),
        "summary": str(meta.get("summary") or ""),
        "description": str(meta.get("description") or pkg_info.get("Description") or ""),
        "locales": locales,
        "i18n": i18n,
        "categories": list_value(meta.get("categories")),
        "author": (meta.get("author") if isinstance(meta.get("author"), dict) and meta.get("author") else None)
                  or author_from_maintainer(pkg_info.get("Maintainer", "")),
        "version": pkg_info.get("Version", ""),
        "published_at": published_at,
        "updated_at": updated_at,
        "review": review,
        "license": str(meta.get("license") or ""),
        "source_repo": str(meta.get("source_repo") or ""),
        "download": {
            "type": "deb",
            "package": pkg_name,
            "url": download_url,
            "md5": pkg_info.get("MD5sum", ""),
            "sha256": sha256,
            "size": int(pkg_info.get("Size", 0) or 0),
        },
        "depends": pkg_info.get("Depends", ""),
        "permissions": meta.get("permissions") if isinstance(meta.get("permissions"), dict) else {},
        "assets": assets,
        "icon": assets["icon"],
        "screenshots": assets["screenshots"],
    }
    return app


def build_registry(packages_path: Path, meta_dir: Path, overrides_path: Path) -> dict[str, Any]:
    packages = parse_packages(packages_path)
    overrides = read_json(overrides_path, {})
    generated_at = now_iso()
    apps = []
    for pkg_name, pkg_info in sorted(packages.items()):
        meta_path = meta_dir / f"{pkg_name}.json"
        if not meta_path.exists():
            continue
        meta = read_json(meta_path, {})
        if not isinstance(meta, dict):
            continue
        override = overrides.get(pkg_name, {}) if isinstance(overrides, dict) else {}
        if isinstance(override, dict):
            meta = deep_merge(meta, override)
        apps.append(build_app(pkg_name, pkg_info, meta, generated_at))

    return {
        "schema_version": 2,
        "generated_at": generated_at,
        "registry_id": "cardputerzero-appstore",
        "device_targets": ["CardputerZero"],
        "i18n": {
            "default_locale": "en",
            "fallback_locale": "en",
            "supported_locales": SUPPORTED_LOCALES,
        },
        "apps": apps,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--packages", type=Path, required=True)
    parser.add_argument("--meta-dir", type=Path, required=True)
    parser.add_argument("--overrides", type=Path, default=Path("registry-overrides.json"))
    parser.add_argument("--out", type=Path, default=Path("generated"))
    args = parser.parse_args()

    registry = build_registry(args.packages, args.meta_dir, args.overrides)
    args.out.mkdir(parents=True, exist_ok=True)
    for name in ("registry.json", "registry-index.json"):
        (args.out / name).write_text(json.dumps(registry, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Generated registry with {len(registry['apps'])} app(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
