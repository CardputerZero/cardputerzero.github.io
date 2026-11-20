import hashlib
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import generate_registry as generator
import prepare_registry_inputs as prepare


class RegistrySyncTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.pool = self.root / "pool"
        self.meta = self.root / "meta"
        self.index = self.root / "Packages"
        self.overrides = self.root / "overrides.json"

    def manifest(self, pkg, version, body=b"package"):
        path = self.pool / pkg
        path.mkdir(parents=True, exist_ok=True)
        filename = f"{pkg}_{version.replace(':', '.')}_arm64.deb"
        record = {"package": pkg, "version": version, "filename": filename,
                  "sha256": hashlib.sha256(body).hexdigest(), "size": len(body)}
        (path / f"{filename}.release.json").write_text(json.dumps(record))
        (path / "meta.json").write_text(json.dumps({"title": pkg}))
        return record

    @staticmethod
    def package(record):
        return (f'Package: {record["package"]}\nVersion: {record["version"]}\n'
                f'Architecture: arm64\nSize: {record["size"]}\nSHA256: {record["sha256"]}\n'
                f'Filename: https://github.com/CardputerZero/packages/releases/download/apt-pool/{record["filename"]}\n\n').encode()

    def test_source_snapshot_uses_debian_version_order_and_rejects_partial_index(self):
        old = self.manifest("sample", "1.9")
        new = self.manifest("sample", "1.10")
        other = self.manifest("another", "1:0.1")
        expected = prepare.catalog_from_snapshot(self.pool)
        self.assertEqual(expected["sample"], [new])
        self.index.write_bytes(self.package(old) + self.package(other))
        with self.assertRaisesRegex(ValueError, "mismatched=.*sample"):
            prepare.check_index(self.index, expected)
        self.index.write_bytes(self.package(new))
        with self.assertRaisesRegex(ValueError, "missing=.*another"):
            prepare.check_index(self.index, expected)
        self.index.write_bytes(self.package(old) + self.package(new) + self.package(other))
        self.assertEqual(prepare.check_index(self.index, expected)["sample"]["Version"], "1.10")

    def test_expected_hash_retries_stale_index_and_publishes_complete_snapshot(self):
        old = self.manifest("sample", "1.0")
        current = self.manifest("sample", "2.0")
        good = self.package(current)
        source = [io.BytesIO(self.package(old)), io.BytesIO(good)]
        with patch.object(prepare.urllib.request, "urlopen", side_effect=source) as fetch, \
             patch.object(prepare.time, "sleep"):
            prepare.prepare(self.pool, self.index, self.meta, hashlib.sha256(good).hexdigest())
        self.assertEqual(fetch.call_count, 2)
        self.assertEqual(self.index.read_bytes(), good)
        registry = generator.build_registry(self.index, self.meta, self.overrides)
        self.assertEqual(registry["apps"][0]["version"], "2.0")

    def test_missing_metadata_cannot_replace_previous_registry(self):
        first = self.manifest("sample", "1.0")
        second = self.manifest("another", "1.0")
        (self.pool / "another/meta.json").unlink()
        self.index.write_bytes(self.package(first))
        with patch.object(prepare.urllib.request, "urlopen") as fetch, self.assertRaisesRegex(ValueError, "another"):
            prepare.prepare(self.pool, self.index, self.meta)
        fetch.assert_not_called()
        self.index.write_bytes(self.package(first) + self.package(second))
        self.meta.mkdir()
        (self.meta / "sample.json").write_text('{"title":"sample"}')
        with self.assertRaisesRegex(ValueError, "another"):
            generator.build_registry(self.index, self.meta, self.overrides)

    def test_legitimate_withdrawal_and_empty_snapshot_are_allowed(self):
        expected = prepare.catalog_from_snapshot(self.pool)
        self.index.write_bytes(b"")
        self.assertEqual(prepare.check_index(self.index, expected), {})
        self.meta.mkdir()
        self.assertEqual(generator.build_registry(self.index, self.meta, self.overrides)["apps"], [])

    def test_unavailable_complete_index_leaves_existing_output_unchanged(self):
        self.manifest("sample", "2.0")
        self.index.write_bytes(b"previous")
        with patch.object(prepare.urllib.request, "urlopen", side_effect=lambda *a, **k: io.BytesIO(b"")), \
             patch.object(prepare.time, "sleep"), self.assertRaises(RuntimeError):
            prepare.fetch_index(self.index, prepare.catalog_from_snapshot(self.pool), attempts=2)
        self.assertEqual(self.index.read_bytes(), b"previous")


if __name__ == "__main__":
    unittest.main()
