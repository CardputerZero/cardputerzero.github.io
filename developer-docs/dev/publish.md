# AppStore Submission

Publish your app to the CardputerZero AppStore using the `czdev` CLI tool.

## Overview

```
Developer → czdev login → czdev publish → PR auto-created → Review → Merged → Live in AppStore
```

No manual git operations needed. `czdev` handles forking, branching, uploading, and PR creation automatically.

## Prerequisites

- `czdev` CLI installed ([CardputerZero-AppBuilder](https://github.com/CardputerZero/CardputerZero-AppBuilder))
- `git` and `git-lfs` installed
- A built `.deb` package
- Screenshots (320×170 PNG) and icon (100×100 PNG)

## Step 1: Login (one-time)

```bash
czdev login
```

Opens GitHub OAuth in your browser (Device Flow). After authorization, your token is stored at `~/.config/czdev/token`.

## Step 2: Build Your Package

```bash
cd CardputerZero-AppBuilder
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/MyApp
```

## Step 3: Publish

```bash
czdev publish --deb dist/myapp_1.0-m5stack1_arm64.deb
```

This automatically:
1. Validates your `.deb` (checks `.desktop`, email, size < 100 MB)
2. Forks `CardputerZero/packages` (if needed)
3. Creates a `publish/myapp-1.0-<timestamp>` branch
4. Uploads `.deb` via git-lfs + `meta.json` + icon + screenshots
5. Opens a Pull Request
6. Returns the PR URL

## Step 4: Review

- CI validates package structure
- A maintainer reviews the app
- Once merged, the app appears in AppStore within minutes

## Metadata (meta.json)

Place alongside your source in `app-builder.json` or provide during publish:

```json
{
  "title": "My App",
  "summary": "One-line description",
  "description": "Detailed description.",
  "locales": {
    "zh-CN": {
      "title": "我的应用",
      "summary": "简短描述"
    }
  },
  "categories": ["Games"],
  "license": "MIT",
  "source_repo": "https://github.com/you/myapp",
  "icon": "myapp.png",
  "screenshots": ["screenshots/01.png"],
  "permissions": {
    "microphone": false,
    "audio_output": true,
    "network": false,
    "keyboard_input": true
  }
}
```

### Categories

Games, Utilities, Communication, AI, Media, Education, Development, System

### Permissions

| Permission | Description |
|-----------|-------------|
| `microphone` | MEMS mic access |
| `audio_output` | Speaker / 3.5mm |
| `network` | WiFi / Ethernet |
| `filesystem` | `"app-data-only"` or `"full"` |
| `keyboard_input` | Keyboard events |
| `background_service` | Runs after exit |
| `external_hardware` | GPIO / Grove / USB |

## Updating

```bash
# Bump version in meta.env, rebuild, then:
czdev publish --deb dist/myapp_1.1-m5stack1_arm64.deb
```

A new PR is created for the version bump.

## Share Codes

After approval, your app gets a 4-character share code. Users press `S` on the home screen and enter the code to install.

## Guidelines

- Must work on 320×170 display
- Handle ESC key to exit cleanly
- No malware, adware, or miners
- Must not modify system files outside `/usr/share/APPLaunch/`
- Icon must be original or properly licensed
- Include at least one screenshot
- Package size < 100 MB
