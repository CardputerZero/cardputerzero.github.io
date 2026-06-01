# Docker SDK Setup

Build CardputerZero apps on **any OS** (Windows, macOS, Linux) with a single command. No cross-compilation setup needed.

## Prerequisites

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine (Linux).

::: tip macOS Apple Silicon
Docker runs arm64 Linux natively on Apple Silicon — no emulation overhead. Builds are fast.
:::

## One-Command Build

```bash
# Clone the examples repository
git clone https://github.com/eggfly/CardputerZero-Examples.git
cd CardputerZero-Examples

# Build ALL examples into .deb packages
docker run --rm -v $(pwd):/src ghcr.io/cardputerzero/sdk:latest

# Output
ls dist/
# → demo-2048_0.1.0-m5stack1_arm64.deb
# → game-tetris_0.1.0-m5stack1_arm64.deb
# → ...
```

## Build a Single App

```bash
docker run --rm -v $(pwd):/src ghcr.io/cardputerzero/sdk:latest \
  scripts/pack-deb.sh SDL2_HelloWorld
```

## Deploy to Device

```bash
# Copy .deb to device
scp dist/myapp_*.deb pi@192.168.x.x:/tmp/

# Install and restart launcher
ssh pi@192.168.x.x "sudo dpkg -i /tmp/myapp_*.deb && sudo systemctl restart APPLaunch"
```

Your app now appears in the APPLauncher home screen.

## What's Inside the SDK Image

The `ghcr.io/cardputerzero/sdk` Docker image includes:

| Tool | Purpose |
|------|---------|
| GCC/G++ | C/C++ compiler (arm64 native) |
| CMake, Make | Build systems |
| SDL2 + SDL2_ttf + SDL2_mixer | Game/multimedia development |
| LVGL dependencies | Embedded UI framework |
| Qt5 dev | Desktop-style UI |
| Rust toolchain | Rust applications |
| Python 3 | Scripting and Python apps |
| dpkg-deb | .deb package creation |

## Build the Image Locally

If you prefer to audit and build yourself:

```bash
git clone https://github.com/eggfly/CardputerZero-Examples.git
cd CardputerZero-Examples
docker build --platform linux/arm64 -t cardputerzero-sdk .
```

## Verify Image Authenticity

Our images are signed with [Sigstore cosign](https://docs.sigstore.dev/):

```bash
cosign verify \
  --certificate-identity-regexp="github.com/CardputerZero/.*" \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  ghcr.io/cardputerzero/sdk:latest
```

## Troubleshooting

### "Cannot connect to the Docker daemon"
Start Docker Desktop or run `sudo systemctl start docker`.

### Build is slow on first run
The first `docker run` downloads the ~1.5GB image. Subsequent builds use the cached image and only compile your code.

### "permission denied" on Linux
Add your user to the docker group: `sudo usermod -aG docker $USER` then log out/in.
