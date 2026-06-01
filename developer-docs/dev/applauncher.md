# APPLauncher Architecture

APPLauncher is the home screen and application manager for CardputerZero.

## Stack

```
APPLauncher binary
├── UI Layer (LVGL 9.x)
│   ├── Home carousel (horizontal swipe)
│   ├── Settings (vertical carousel)
│   └── App pages (full-screen takeover)
├── HAL Layer (C)
│   ├── hal_settings (WiFi, BT, battery)
│   ├── hal_audio (ES8389 via I2S)
│   ├── hal_config (key-value persistence)
│   └── hal_process (fork/exec apps)
└── Linux APIs
    ├── fbdev (display)
    ├── libinput/evdev (keyboard)
    ├── nmcli (WiFi)
    └── systemd (service lifecycle)
```

## Source

[M5CardputerZero-Launcher](https://github.com/CardputerZero/M5CardputerZero-Launcher)

## Building

```bash
docker run --rm -v $(pwd):/src -w /src/projects/APPLaunch \
  ghcr.io/cardputerzero/build-env:latest \
  bash -c "CardputerZero=y CONFIG_REPO_AUTOMATION=y scons -j4"
```

## App Lifecycle

1. APPLauncher starts as systemd service
2. User selects app → APPLauncher forks child process
3. APPLauncher pauses rendering (if `Sysplause=true`)
4. Child app has exclusive framebuffer access
5. Child exits → APPLauncher resumes
6. ESC key sends SIGTERM to child if held

## Configuration

Settings stored in `/var/lib/applaunch/settings` (key=value format).
Apps enabled/disabled via `app_XXX=1/0` keys.
