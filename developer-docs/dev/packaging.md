# App Packaging

How to turn your compiled application into a `.deb` package for the CardputerZero AppStore.

## Package Structure

Every app lives in a directory with a `packaging/` subdirectory:

```
examples/MyApp/
├── main.c                    # Your source code
├── Makefile                  # Build system
└── packaging/
    ├── meta.env              # REQUIRED: package metadata
    ├── build.sh              # REQUIRED: compile script
    ├── stage.sh              # REQUIRED: install script
    ├── icon.png              # Optional: 100×100 app icon
    ├── app.desktop.in        # Optional: custom .desktop template
    ├── postinst              # Optional: post-install hook
    └── prerm                 # Optional: pre-remove hook
```

## meta.env

Defines package name, version, dependencies, and how the app appears in APPLauncher.

```bash
PKG_NAME="myapp"              # Debian package name (lowercase, hyphens ok)
PKG_VERSION="1.0"             # Semantic version
PKG_REVISION="m5stack1"       # Package revision (usually m5stack1)
PKG_DESC="My awesome app"     # One-line description
PKG_DEPENDS="libsdl2-2.0-0"  # Runtime apt dependencies (comma-separated)
APP_NAME="My App"             # Display name in launcher
APP_EXEC="/usr/share/APPLaunch/apps/myapp/myapp"  # Absolute path to binary
APP_TERMINAL=false            # true if app needs a terminal
APP_ICON="share/images/myapp.png"  # Icon path (relative to APPLaunch root)
```

## build.sh

Runs in the app's source directory. Must produce the binary.

```bash
#!/bin/bash
set -e
make clean
make
```

Make it executable: `chmod +x packaging/build.sh`

## stage.sh

Copies built artifacts into the staging directory (`$STAGE`). Environment variables available:

| Variable | Value |
|----------|-------|
| `$STAGE` | Temporary root (like `/tmp/pack-deb-XXXXX`) |
| `$INSTALL_PREFIX` | `/usr/share/APPLaunch` |
| `$APP_INSTALL_DIR` | `/usr/share/APPLaunch/apps/$PKG_NAME` |
| `$PKG_NAME` | From meta.env |

```bash
#!/bin/bash
set -e
mkdir -p "$STAGE$APP_INSTALL_DIR"
cp myapp "$STAGE$APP_INSTALL_DIR/"
# Optional: copy assets
cp -r assets/ "$STAGE$APP_INSTALL_DIR/"
```

Make it executable: `chmod +x packaging/stage.sh`

## Build the Package

```bash
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/MyApp
```

Output: `dist/myapp_1.0-m5stack1_arm64.deb`

## Inspect the Package

```bash
dpkg-deb --info dist/myapp_*.deb    # Show metadata
dpkg-deb --contents dist/myapp_*.deb # List files
```

## Install Layout

After `dpkg -i`, files are placed at:

```
/usr/share/APPLaunch/
├── applications/myapp.desktop   # .desktop entry (auto-generated)
├── apps/myapp/                  # Your app files
│   └── myapp                    # Binary
├── bin/                         # Symlink (if APP_EXEC points here)
└── share/images/myapp.png       # App icon
```

## Dependencies

List runtime dependencies in `PKG_DEPENDS`. Common ones:

| Library | Package Name |
|---------|-------------|
| SDL2 | `libsdl2-2.0-0` |
| SDL2_ttf | `libsdl2-ttf-2.0-0` |
| SDL2_mixer | `libsdl2-mixer-2.0-0` |
| Qt5 Widgets | `libqt5widgets5` |
| Python 3 | `python3` |
| PIL | `python3-pil` |
| ALSA | `libasound2` |
| Wayland | `libwayland-client0` |
| Fonts | `fonts-dejavu-core` |

## Next Steps

- [Publish to AppStore](/dev/publish) — Submit your package for distribution
- [.desktop Spec](/dev/desktop-spec) — Customize how your app appears
