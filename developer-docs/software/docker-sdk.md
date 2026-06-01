# Build with Docker SDK

Compile CardputerZero apps on any OS (Windows, macOS, Linux) using our pre-built Docker image.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine (Linux)
- Git

## Quick Build

```bash
# Clone an example
git clone https://github.com/eggfly/CardputerZero-Examples.git
cd CardputerZero-Examples

# Build ALL examples into .deb packages
docker run --rm -v $(pwd):/src ghcr.io/cardputerzero/sdk:latest

# Output: dist/*.deb
ls dist/
```

## Build a Single App

```bash
docker run --rm -v $(pwd):/src ghcr.io/cardputerzero/sdk:latest \
  scripts/pack-deb.sh SDL2_HelloWorld
```

## Build Your Own App

```bash
# Create from template
cp -r _template MyApp
cd MyApp

# Edit packaging/meta.env, packaging/build.sh, packaging/stage.sh
# Then build:
docker run --rm -v $(pwd)/..:/src ghcr.io/cardputerzero/sdk:latest \
  scripts/pack-deb.sh MyApp
```

## What's Inside the Docker Image

The SDK image (`ghcr.io/cardputerzero/sdk`) is based on Ubuntu 24.04 arm64 and includes:

- GCC/G++ toolchain
- CMake, Make, pkg-config
- SDL2 + SDL2_ttf + SDL2_mixer development libraries
- Qt5 development libraries
- LVGL dependencies (freetype, libpng, libjpeg, libinput)
- Rust toolchain
- Python 3
- dpkg-deb for .deb packaging

## Build the Image Locally

If you prefer to build the Docker image yourself:

```bash
docker build --platform linux/arm64 -t cardputerzero-sdk .
```

## Deploy to Device

After building:

```bash
scp dist/myapp_*.deb pi@<device-ip>:/tmp/
ssh pi@<device-ip> "sudo dpkg -i /tmp/myapp_*.deb && sudo systemctl restart APPLaunch"
```

## Verify Image Signature

Our images are signed with cosign. Verify authenticity:

```bash
cosign verify \
  --certificate-identity-regexp="github.com/CardputerZero/.*" \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  ghcr.io/cardputerzero/sdk:latest
```
