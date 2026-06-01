# Build Environment Setup

Build CardputerZero apps on **any OS** (Windows, macOS, Linux) using Docker. No cross-compilation or toolchain setup needed.

## Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine (Linux)
2. Install [Git](https://git-scm.com/)

::: tip macOS Apple Silicon
Docker runs arm64 Linux natively — builds are fast, no emulation.
:::

## Step 1: Clone the AppBuilder

```bash
git clone https://github.com/CardputerZero/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
```

This repository contains:
- `examples/` — 25+ ready-to-build sample apps
- `scripts/` — Build and packaging tools
- `Dockerfile` — The build environment definition

## Step 2: Build an Example

```bash
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/SDL2_HelloWorld
```

Output:
```
==[ sdl2-hello 0.1-m5stack1 (arm64) ]==
-- build.sh
-- stage.sh
-- built: dist/sdl2-hello_0.1-m5stack1_arm64.deb
```

## Step 3: Deploy to Device

```bash
scp dist/sdl2-hello_0.1-m5stack1_arm64.deb pi@192.168.x.x:/tmp/
ssh pi@192.168.x.x "sudo dpkg -i /tmp/sdl2-hello_*.deb"
```

The app appears in APPLauncher immediately.

## Build All Examples

```bash
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-all.sh
```

Outputs 25+ `.deb` files in `dist/`.

---

## Create Your Own App

### From Template

```bash
cp -r examples/SDL2_HelloWorld examples/MyGame
cd examples/MyGame
```

Edit three files:

### 1. `packaging/meta.env` — App metadata

```bash
PKG_NAME="mygame"
PKG_VERSION="0.1"
PKG_DESC="My first CardputerZero game"
PKG_DEPENDS="libsdl2-2.0-0"
APP_NAME="MyGame"
APP_EXEC="/usr/share/APPLaunch/apps/mygame/mygame"
```

### 2. `packaging/build.sh` — How to compile

```bash
#!/bin/bash
make
```

### 3. `packaging/stage.sh` — What goes in the .deb

```bash
#!/bin/bash
mkdir -p "$STAGE$APP_INSTALL_DIR"
cp mygame "$STAGE$APP_INSTALL_DIR/"
```

### 4. Build it

```bash
cd ../..  # back to AppBuilder root
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/MyGame
```

---

## Available Frameworks

| Framework | Example | Use Case |
|-----------|---------|----------|
| SDL2 | `examples/SDL2_HelloWorld` | Games, graphics |
| SDL2 + TTF + Mixer | `examples/SDL2_Game` | Games with fonts and audio |
| LVGL 9 | `examples/LVGL_HelloWorld` | Embedded UIs, dashboards |
| Python + PIL | `examples/Python_FrameBuffer_HelloWorld` | Quick prototypes |
| Python + Tkinter | `examples/Python_Tkinter_HelloWorld` | Simple GUIs |
| PyQt5 | `examples/PyQt5_HelloWorld` | Desktop-style apps |
| Qt5 (C++) | `examples/Qt_HelloWorld` | Complex desktop apps |
| Rust | `examples/Rust_FrameBuffer_HelloWorld` | Systems programming |
| Raw Framebuffer (C) | `examples/FrameBuffer_HelloWorld` | Maximum performance |

---

## What's Inside the Docker Image

`ghcr.io/cardputerzero/build-env` is an arm64 Ubuntu 24.04 image with:

- GCC/G++ compiler
- CMake, Make, pkg-config
- SDL2 + SDL2_ttf + SDL2_mixer (dev)
- Qt5 (dev)
- LVGL dependencies (freetype, libpng, libjpeg, libinput)
- Rust toolchain (rustc + cargo)
- Python 3 + PIL + NumPy
- ALSA development libraries
- dpkg-deb for .deb packaging

## Build the Image Locally

```bash
docker build --platform linux/arm64 -t cardputerzero-build .
docker run --rm -v $(pwd):/src -w /src cardputerzero-build \
  scripts/pack-deb.sh examples/SDL2_HelloWorld
```

## Troubleshooting

### "Cannot connect to the Docker daemon"
Start Docker Desktop, or on Linux: `sudo systemctl start docker`

### First run is slow
The ~1.5GB image downloads once. Subsequent builds are instant.

### "permission denied" on Linux
```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

### Build fails with "No such file or directory"
Make sure you're in the AppBuilder root directory (where `scripts/` is).
