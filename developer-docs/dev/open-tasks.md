# Open Tasks

Help build CardputerZero! Here are areas where community contributions are welcome.

::: tip How to Contribute
Pick a task, open an issue in the relevant repository to claim it, then submit a PR. See [Contributing](/dev/contributing) for guidelines.
:::

## 🔴 High Priority

### System & Infrastructure

| Task | Repo | Difficulty | Description |
|------|------|-----------|-------------|
| Docker SDK CI publish | CardputerZero-Examples | Medium | Set up GitHub Actions to auto-build and push SDK image to ghcr.io |
| OTA update system | cardputerzero-pigen | Hard | Implement over-the-air system updates (A/B partition or delta) |
| App sandboxing | cardputer-zero-os | Hard | Isolate installed apps with Linux namespaces/seccomp |

### Application Layer

| Task | Repo | Difficulty | Description |
|------|------|-----------|-------------|
| Settings persistence + Home integration | M5CardputerZero-Launcher | Medium | Complete JSON config → home page app filtering |
| WiFi captive portal support | M5CardputerZero-Launcher | Medium | Detect and handle captive portal login |
| Bluetooth audio (A2DP) | M5CardputerZero-Launcher | Hard | Stream audio to BT speakers/headphones |
| File manager app | CardputerZero-Examples | Medium | Browse/copy/delete files with keyboard navigation |

## 🟡 Medium Priority

### Developer Experience

| Task | Repo | Difficulty | Description |
|------|------|-----------|-------------|
| `czdev` CLI tool | skill | Medium | Scaffold, build, test, publish apps from terminal |
| VS Code Dev Container | CardputerZero-Examples | Easy | `.devcontainer/` config for one-click dev environment |
| Hot-reload over SSH | CardputerZero-Examples | Medium | `scons push` auto-deploy on save |
| Web emulator improvements | M5CardputerZero-Emulator | Medium | Better keyboard mapping, touch simulation |

### Apps Wanted

| App | Type | Difficulty | Description |
|-----|------|-----------|-------------|
| Terminal emulator | Native (C) | Medium | Better than bash — scrollback, colors, resize |
| Text editor | Native (C/Rust) | Medium | nano/micro-like with syntax highlighting |
| Web browser | Qt5/WebEngine | Hard | Minimal browser for 320×170 |
| Podcast player | Python | Easy | RSS feed + streaming audio |
| Weather widget | Python | Easy | Current weather + forecast display |
| Flashcard / Anki | Python/LVGL | Medium | Spaced repetition learning |
| MIDI controller | C | Medium | Use keyboard as MIDI input over USB |
| IRC client | C/Python | Medium | Lightweight chat for 320×170 |

## 🟢 Good First Issues

| Task | Repo | Difficulty | Description |
|------|------|-----------|-------------|
| Add app icons (100×100 PNG) | CardputerZero-Examples | Easy | Design icons for existing examples |
| Translate docs to Japanese | cardputerzero.github.io | Easy | Translate user guide to Japanese |
| Translate docs to Traditional Chinese | cardputerzero.github.io | Easy | zh-TW translation |
| Add more SDL2 game examples | CardputerZero-Examples | Easy | Port simple games (Snake, Breakout) |
| Improve README for examples | CardputerZero-Examples | Easy | Add screenshots and build instructions |
| Document keyboard matrix mapping | cardputerzero.github.io | Easy | Complete keycode table |

## 🔵 Research / Exploration

| Topic | Description |
|-------|-------------|
| Power optimization | Profile power consumption, optimize sleep states |
| Display refresh optimization | Partial refresh, dirty-rect tracking for ST7789 |
| Camera ML inference | Run TFLite models on IMX219 camera feed |
| Mesh networking | LoRa mesh protocol implementation |
| External antenna LNA | Test SPF5189Z / RFX2401C for WiFi range extension |
| Alternative OS | Armbian, DietPi, or custom minimal Linux |
