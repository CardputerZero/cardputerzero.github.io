# CardputerZero App Submission Guide

This guide describes the current path for publishing an app to the CardputerZero on-device AppStore.

## Overview

The preferred publishing path is the `czdev` CLI from [CardputerZero-AppBuilder](https://github.com/m5stack/CardputerZero-AppBuilder). Developers publish an installable `.deb`; `czdev` validates the package, pushes it to `CardputerZero/packages` through Git LFS, and opens a Pull Request for maintainer review. After merge, the packages repository updates the APT index and this Hub syncs `generated/registry.json` from package metadata.

Short flow:

1. Develop the app in your own GitHub repository.
2. Build an ARM64 Debian `.deb` with APPLaunch-compatible files.
3. Validate the package and store assets locally.
4. Run `czdev login` once.
5. Run `czdev publish --deb <package>`.
6. Review the generated Pull Request in `CardputerZero/packages`.
7. Wait for maintainer approval, package-index rebuild, and Hub registry sync.

Only apps whose registry review status is `approved` are installable from the on-device AppStore.

## Install And Check `czdev`

Install prerequisites before building or publishing.

macOS:

```bash
brew install cmake pkg-config sdl2 sdl2_image sdl2_mixer freetype git-lfs dpkg
```

Debian or Ubuntu:

```bash
sudo apt install -y build-essential cmake pkg-config \
  libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev libfreetype-dev \
  git-lfs dpkg
```

Build `czdev` from source:

```bash
git clone --recursive git@github.com:m5stack/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
cargo build --release -p czdev
./target/release/czdev doctor
```

If the repository was cloned without submodules:

```bash
git submodule update --init --recursive
```

You can also download a prebuilt `czdev` from the AppBuilder GitHub Releases page and put it on `PATH`. After installation, run:

```bash
czdev doctor
```

The doctor output is the source of truth for missing local desktop-development dependencies.

Useful development commands:

```bash
czdev list .
czdev run examples/hello_cz
czdev watch examples/hello_cz
czdev deploy --host pi@<device-ip> --deb build/my_app_1.0.0_arm64.deb
```

## Package Requirements

The `.deb` must install an APPLaunch application under `/usr/share/APPLaunch`.

Required package content:

- `usr/share/APPLaunch/applications/<app>.desktop`
- an executable or wrapper under `usr/share/APPLaunch/bin/`
- a square PNG icon under `usr/share/APPLaunch/share/images/`
- any required fonts or assets under `usr/share/APPLaunch/share/`

The `.desktop` entry must include at least:

```ini
[Desktop Entry]
Name=MyApp
Exec=bin/myapp
Terminal=false
Icon=share/images/myapp.png
Type=Application
```

Use `Terminal=false` for GUI apps. Put arguments, working-directory changes, and framebuffer environment setup in a wrapper script rather than in `Exec`.

## Store Metadata And Assets

Your app source repository should include an `app-builder.json` with a `store` section:

```json
{
  "package_name": "my-app",
  "app_name": "My App",
  "store": {
    "summary": "Short user-facing summary.",
    "categories": ["Utilities"],
    "icon": "share/images/my-app.png",
    "screenshots": [
      "store/screenshots/main.png",
      "store/screenshots/detail.png",
      "store/screenshots/settings.png",
      "store/screenshots/confirm.png"
    ],
    "locales": {
      "zh-CN": {
        "title": "我的应用",
        "summary": "简短中文简介。",
        "description": "面向中文用户的说明。"
      },
      "en": {
        "title": "My App",
        "summary": "Short English summary.",
        "description": "English description for users."
      },
      "ja": {
        "title": "マイアプリ",
        "summary": "短い日本語の説明。",
        "description": "日本語ユーザー向けの説明。"
      }
    }
  }
}
```

Screenshots submitted to AppStore should be exactly four clean 320 x 170 images of the app framebuffer. Do not include emulator chrome, device frames, desktop background, black padding, or scaled margins.

Package metadata copied into `CardputerZero/packages` must use paths relative to `pool/main/<package>/`, such as:

```json
{
  "icon": "my-app.png",
  "screenshots": [
    "screenshots/main.png",
    "screenshots/detail.png",
    "screenshots/settings.png",
    "screenshots/confirm.png"
  ],
  "published_at": "2026-05-14T23:20:55+08:00",
  "updated_at": "2026-05-14T23:20:55+08:00"
}
```

`published_at` and `updated_at` must be ISO 8601 timestamps with seconds and an explicit timezone. Keep `published_at` stable after first release. Update `updated_at` when the package, screenshots, icon, description, permissions, or review status changes.

## Mandatory Prepublish Check

Before publishing, run the strict prepublish check from the `cardputer-app-publish` skill checkout:

```bash
python3 /path/to/cardputer-app-publish/scripts/prepublish_check.py \
  --deb build/my_app_1.0.1_arm64.deb \
  --app-dir .
```

Treat every `ERROR` as a blocker. The check verifies:

- `app-builder.json` exists and has a `store` section.
- `store.summary`, `store.categories`, `store.icon`, and screenshots are present.
- source icon and screenshots exist; the icon is a square PNG.
- `.deb` control fields include `Package`, `Version`, `Architecture=arm64`, and `Maintainer`.
- the `.deb` contains an APPLaunch `.desktop` entry with `Name`, `Exec`, and `Icon`.
- the desktop `Icon` resolves to a square PNG inside the package.
- the desktop `Exec` target exists inside the package when it is absolute or APPLaunch-relative.

If the source icon is missing during a non-interactive publish handoff, generate one, rebuild the package, and rerun the check. Do not publish a `.deb` whose APPLaunch icon is missing.

## Publish With `czdev`

Login once:

```bash
czdev login
```

This uses GitHub OAuth Device Flow and stores the token at `~/.config/czdev/token`.

Check the next version when updating an existing package:

```bash
czdev bump --deb build/my_app_1.0.0_arm64.deb
```

Publish:

```bash
czdev publish --deb build/my_app_1.0.1_arm64.deb
```

`czdev publish` performs preflight checks, verifies that the package version is newer than the published version, pushes the `.deb`, `meta.json`, icon, and screenshots through Git LFS, and opens a Pull Request against `CardputerZero/packages`.

To remove one of your own package versions:

```bash
czdev unpublish my-app --version 1.0.1
```

## Device Validation

Before opening or merging the package Pull Request, test on a real CardputerZero:

- the package installs with `dpkg -i` or APT.
- the app appears in APPLaunch with the expected icon and title.
- the app launches from APPLaunch and returns cleanly.
- GUI fits the 320 x 170 screen.
- CJK text uses CJK-capable fonts and shows no missing-glyph boxes.
- short Esc returns one level or closes a modal; long Esc or Home exits safely.
- framebuffer code respects `LV_LINUX_FBDEV_DEVICE` and does not hard-code `/dev/fb0`.
- permissions, network behavior, external hardware, and background services match the submitted metadata.
- uninstall removes the APPLaunch entry.

## Pull Request Review

The Pull Request should explain:

- what the app does.
- which device and OS image were tested.
- whether it was installed from the submitted `.deb`.
- permissions, network behavior, external hardware, and background services.
- privacy behavior and data retention.
- known limitations.
- links to source, release, package, screenshots, and test logs when available.

CI passing does not guarantee listing. Maintainers still review policy, risk, device safety, user experience, and metadata quality. After approval and merge, the package repository rebuilds the APT index. This website then syncs package `meta.json` into `generated/registry.json`; the device AppStore sees the app after refresh.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `czdev` not found | Build it from AppBuilder or download a release binary, then put it on `PATH`. |
| `czdev doctor` reports missing packages | Install the packages it reports for your OS, then rerun `czdev doctor`. |
| `git-lfs not installed` | Install Git LFS and run `git lfs install`. |
| `dpkg-deb` missing | macOS: `brew install dpkg`; Debian/Ubuntu: `sudo apt install dpkg`. |
| `email_mismatch` | Set the `.deb` `Maintainer` email to match your GitHub account or noreply address. |
| `version_not_newer` | Bump the package version, rebuild the `.deb`, and rerun the prepublish check. |
| `store.icon is required` | Add or generate a square PNG icon, rebuild the `.deb`, and rerun the strict check. |
| App appears online but cannot install | Confirm registry `review.status` is `approved`, package URL is reachable, package name is correct, and MD5 matches the `.deb`. |

See [Developer Submission Policy](#/documents/developer-submission-policy), [Registry And Web UI Requirements](#/documents/appstore-registry-requirements), and [User And Developer Agreement](#/documents/user-agreement) for the policy rules behind these decisions.
