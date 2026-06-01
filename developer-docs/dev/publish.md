# AppStore Submission

Publish your app to the CardputerZero AppStore so users can install it with one click.

## Overview

The AppStore is backed by a GitHub-hosted APT repository at [CardputerZero/packages](https://github.com/CardputerZero/packages). Publishing means submitting a PR to that repo with your `.deb` file and metadata.

## Step 1: Build Your .deb Package

```bash
cd CardputerZero-AppBuilder
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/MyApp
```

Verify the output:
```bash
dpkg-deb --info dist/myapp_0.1-m5stack1_arm64.deb
```

## Step 2: Prepare Metadata

Create a `meta.json` file for your app:

```json
{
  "title": "My App",
  "summary": "A short one-line description.",
  "description": "Detailed description of what the app does.",
  "locales": {
    "zh-CN": {
      "title": "我的应用",
      "summary": "简短描述。",
      "description": "详细描述。"
    }
  },
  "categories": ["Games", "Utilities"],
  "license": "MIT",
  "source_repo": "https://github.com/yourname/myapp",
  "icon": "myapp.png",
  "screenshots": ["screenshots/01.png", "screenshots/02.png"],
  "permissions": {
    "microphone": false,
    "audio_output": true,
    "network": false,
    "filesystem": "app-data-only",
    "keyboard_input": true,
    "background_service": false,
    "external_hardware": false
  }
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `title` | App name (English) |
| `summary` | One-line description (< 80 chars) |
| `categories` | At least one from: Games, Utilities, Communication, AI, Media, Education, Development, System |
| `license` | SPDX identifier (MIT, GPL-3.0, Apache-2.0, etc.) |
| `icon` | 100×100 PNG, transparent background |

### Optional Fields

| Field | Description |
|-------|-------------|
| `locales` | Translations (zh-CN, ja, etc.) |
| `source_repo` | Link to source code |
| `screenshots` | Up to 4 screenshots (320×170 PNG) |
| `permissions` | What the app accesses |
| `description` | Full description (Markdown supported) |

## Step 3: Prepare Assets

```
myapp/
├── myapp_0.1-m5stack1_arm64.deb    # The package
├── meta.json                        # Metadata
├── myapp.png                        # Icon (100×100)
└── screenshots/
    ├── 01.png                       # Screenshots (320×170)
    └── 02.png
```

## Step 4: Submit PR

1. Fork [CardputerZero/packages](https://github.com/CardputerZero/packages)
2. Create directory `pool/main/myapp/`
3. Copy your files into it
4. Submit a Pull Request

```bash
git clone https://github.com/YOUR_FORK/packages.git
cd packages
mkdir -p pool/main/myapp/screenshots
cp /path/to/myapp_*.deb pool/main/myapp/
cp /path/to/meta.json pool/main/myapp/
cp /path/to/myapp.png pool/main/myapp/
cp /path/to/screenshots/*.png pool/main/myapp/screenshots/
git add pool/main/myapp/
git commit -m "publish: myapp 0.1 (arm64)"
git push
# Then open PR on GitHub
```

## Step 5: Review

After PR submission:
- CI validates package structure and metadata
- A maintainer reviews the app
- Once merged, the app appears in the AppStore within minutes

## Share Codes

After approval, your app gets a 4-character share code (e.g., `myap`). Users can enter this code on the device home screen (press `S`) to install directly.

## Updating Your App

To publish a new version:
1. Bump `PKG_VERSION` in `packaging/meta.env`
2. Rebuild the `.deb`
3. Replace the `.deb` in your PR (same directory)
4. Update `meta.json` if description changed

## Guidelines

- Apps must work on 320×170 display
- No malware, adware, or cryptocurrency miners
- Must not modify system files outside `/usr/share/APPLaunch/`
- Should handle ESC key to exit cleanly
- Icon must be your own work or properly licensed
- Include at least one screenshot showing the app running
