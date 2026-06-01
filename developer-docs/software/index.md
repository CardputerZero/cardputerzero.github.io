# Software Overview

CardputerZero runs a full Linux system based on Raspberry Pi OS, with a custom application layer.

## Architecture

```
┌─────────────────────────────────────────┐
│              APPLauncher                 │  LVGL UI (carousel + pages)
├─────────────────────────────────────────┤
│           HAL Layer (C)                 │  Display, Audio, Input, WiFi, BT
├─────────────────────────────────────────┤
│     Linux Kernel + Device Tree          │  fbdev, libinput, I2S, SPI, I2C
├─────────────────────────────────────────┤
│      Raspberry Pi OS (Debian)           │  systemd, apt, SSH, Python
├─────────────────────────────────────────┤
│        CM0 Hardware (BCM2710A1)         │  ARM Cortex-A53, VideoCore IV
└─────────────────────────────────────────┘
```

## Key Components

| Component | Description |
|-----------|------------|
| [OS Image](/software/os-image) | Custom Raspberry Pi OS built with pi-gen |
| [APPLauncher](/software/applauncher) | Home screen and app management (LVGL 9.x) |
| [AppStore](/software/appstore) | On-device app discovery and installation |
| [Docker SDK](/software/docker-sdk) | Cross-platform build environment |
| [App Packaging](/software/packaging) | .deb package creation for distribution |

## Development Options

### Option 1: Native ARM64 Apps (C/C++/Rust)

Best performance. Use SDL2, LVGL, or framebuffer directly.

```bash
# Build with Docker SDK
docker run --rm -v $(pwd):/src ghcr.io/cardputerzero/sdk:latest
```

### Option 2: Python Apps

Fastest to develop. Use PIL for framebuffer, tkinter, or PyQt5.

```python
# No compilation needed — just package and deploy
```

### Option 3: Web-based (Qt WebEngine)

Full web stack on the device.

## Repositories

| Repo | Purpose |
|------|---------|
| [M5CardputerZero-Launcher](https://github.com/CardputerZero/M5CardputerZero-Launcher) | APPLauncher + AppStore |
| [CardputerZero-Examples](https://github.com/eggfly/CardputerZero-Examples) | Sample apps and templates |
| [cardputerzero-pigen](https://github.com/CardputerZero/cardputerzero-pigen) | OS image builder |
| [packages](https://github.com/CardputerZero/packages) | APT repository for AppStore |
