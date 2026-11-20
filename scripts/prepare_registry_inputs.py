"""Fetch a published APT index and verify it against one immutable source snapshot."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import time
import urllib.request

from generate_registry import compare_versions, parse_packages


INDEX_URL = "https://cardputerzero.github.io/packages/dists/stable/main/binary-arm64/Packages"


def catalog_from_snapshot(pool):
    """Use the same highest Debian version selection as the package publisher."""
    expected = {}
    for path in sorted(pool.glob("*/*.deb.release.json")):
        manifest = json.loads(path.read_text())
        pkg, version = manifest["package"], manifest["version"]
        if (pkg != path.parent.name or not re.fullmatch(r"[a-z0-9][a-z0-9.+-]+", pkg)
                or path.name != manifest["filename"] + ".release.json"
                or not re.fullmatch(r"[0-9a-fA-F]{64}", manifest["sha256"])):
            raise ValueError(f"invalid manifest identity: {path}")
        comparison = compare_versions(version, expected[pkg][0]["version"]) if pkg in expected else 1
        if comparison > 0:
            expected[pkg] = [manifest]
        elif comparison == 0:
            expected[pkg].append(manifest)
    return expected


def check_index(index, expected):
    actual = parse_packages(index)
    missing = sorted(set(expected) - set(actual))
    extra = sorted(set(actual) - set(expected))
    wrong = []
    for pkg in sorted(set(expected) & set(actual)):
        row = actual[pkg]
        if not any(row.get("Version") == m["version"]
                   and row.get("SHA256", "").lower() == m["sha256"].lower()
                   and row.get("Size") == str(m["size"])
                   and row.get("Filename", "").rsplit("/", 1)[-1] == m["filename"]
                   for m in expected[pkg]):
            wrong.append(pkg)
    if missing or extra or wrong:
        raise ValueError(f"published Packages does not match source snapshot: missing={missing}, extra={extra}, mismatched={wrong}")
    return actual


def fetch_index(index, expected, expected_sha256="", attempts=8, delay=5):
    if expected_sha256 and not re.fullmatch(r"[0-9a-f]{64}", expected_sha256):
        raise ValueError("invalid expected Packages SHA256")
    temp = index.with_suffix(".pending")
    try:
        for attempt in range(1, attempts + 1):
            try:
                request = urllib.request.Request(
                    f"{INDEX_URL}?registry_sync={time.time_ns()}",
                    headers={"Cache-Control": "no-cache", "User-Agent": "cz-registry-sync"},
                )
                with urllib.request.urlopen(request, timeout=15) as response:
                    content = response.read()
                if expected_sha256 and hashlib.sha256(content).hexdigest() != expected_sha256:
                    raise ValueError("published Packages SHA256 does not match dispatch")
                temp.write_bytes(content)
                actual = check_index(temp, expected)
                temp.replace(index)
                print(f"Verified published index: {len(actual)} apps (attempt {attempt})", flush=True)
                return
            except (OSError, ValueError, UnicodeError) as exc:
                print(f"Packages check {attempt}/{attempts}: {exc}", flush=True)
                if attempt < attempts:
                    time.sleep(delay)
        raise RuntimeError("could not obtain the complete published Packages snapshot")
    finally:
        temp.unlink(missing_ok=True)


def prepare(pool, index, meta_dir, expected_sha256=""):
    expected = catalog_from_snapshot(pool)
    # Every expected listing must exist, even on a metadata-only update.
    for pkg in expected:
        meta = pool / pkg / "meta.json"
        if not meta.is_file():
            raise ValueError(f"source snapshot missing meta.json for {pkg}")
        value = json.loads(meta.read_text())
        if not isinstance(value, dict) or not value:
            raise ValueError(f"source snapshot invalid meta.json for {pkg}")
    fetch_index(index, expected, expected_sha256)
    meta_dir.mkdir(parents=True, exist_ok=True)
    for pkg in expected:
        shutil.copyfile(pool / pkg / "meta.json", meta_dir / f"{pkg}.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pool", type=Path, required=True)
    parser.add_argument("--packages", type=Path, required=True)
    parser.add_argument("--meta-dir", type=Path, required=True)
    parser.add_argument("--expected-sha256", default="")
    args = parser.parse_args()
    prepare(args.pool, args.packages, args.meta_dir, args.expected_sha256)
