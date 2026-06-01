# Architecture Overview

CardputerZero runs a full Linux system with a custom application layer optimized for the 320×170 display and 46-key keyboard.

## System Stack

```
┌─────────────────────────────────────────────────┐
│           APPLauncher (Home Screen)             │  LVGL 9.x UI
├─────────────────────────────────────────────────┤
│              HAL Layer (C)                      │  Display, Audio, Input, WiFi, BT
├─────────────────────────────────────────────────┤
│        Linux Kernel + Device Tree               │  fbdev, libinput, I2S, SPI, I2C
├─────────────────────────────────────────────────┤
│         Raspberry Pi OS (Debian Bookworm)        │  systemd, apt, SSH, Python 3.11
├─────────────────────────────────────────────────┤
│      CM0 Hardware (BCM2710A1 Cortex-A53 ×4)     │  VideoCore IV, 512MB LPDDR2
└─────────────────────────────────────────────────┘
```

## Application Types

| Type | Framework | Language | Best For |
|------|-----------|----------|----------|
| Native GUI | SDL2 | C/C++ | Games, real-time graphics |
| Native GUI | LVGL | C | Embedded-style UIs |
| Native GUI | Qt5 | C++ | Complex desktop-style apps |
| Scripted | Python + PIL | Python | Quick prototypes, tools |
| Scripted | Python + Tkinter | Python | Simple GUIs |
| Native | Framebuffer | C/Rust | Maximum performance |
| Native | Rust + minifb | Rust | Safe systems apps |

## Development Workflow

```bash
# 1. Clone the AppBuilder
git clone https://github.com/CardputerZero/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder

# 2. Build any example with one command
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/SDL2_HelloWorld

# 3. Deploy to device
scp dist/sdl2-hello_*.deb pi@<device-ip>:/tmp/
ssh pi@<device-ip> "sudo dpkg -i /tmp/sdl2-hello_*.deb"

# 4. App appears in APPLauncher immediately
```

## Key Specs (Developer-Relevant)

| Component | Detail |
|-----------|--------|
| Display | 320×170, ST7789V3, SPI0, 16-bit color |
| Input | 46 keys via TCA8418 (I2C), key-up/key-down events |
| Audio | ES8389 I2S codec, 22.05/44.1/48 kHz |
| Storage | MicroSD (ext4), apps at `/usr/share/APPLaunch/` |
| Network | WiFi (nmcli), Ethernet (eth0), BT (bluetoothctl) |
| Camera | IMX219 8MP via libcamera (Full version) |
| GPIO | I2C, SPI, UART exposed on Grove + HAT ports |

## Quick Links

- [Docker SDK Setup](/dev/docker-sdk) — **Start here** to build your first app
- [Hello World](/dev/hello-world) — Minimal working examples
- [App Packaging](/dev/packaging) — Create .deb for AppStore
- [Tech Specs](/dev/tech-specs) — Complete hardware reference
- [Repositories](/dev/repositories) — Source code index
