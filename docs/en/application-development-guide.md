# CardputerZero App Development Guide

This document is for regular app development. AI coding can help, but it should not be the first concept a developer meets. Start with the runtime, repository roles, APPLaunch contract, and a small HelloWorld app so generated code can be judged correctly later.

## Languages

Recommended options:

- **C/C++ + LVGL 9.5**: default choice for 320 x 170 GUI apps, keyboard input, and framebuffer output.
- **C/C++ + SDL**: useful for desktop debugging; final builds still need Linux framebuffer.
- **Shell wrappers**: useful for environment variables, working directory setup, arguments, or `LV_LINUX_FBDEV_DEVICE` injection.
- **Python / Node / other languages**: acceptable for tooling, background services, or prototypes, but check dependencies, startup time, memory use, fonts, and exit behavior before submission.

GUI apps should normally use `Terminal=false`. Use `Terminal=true` only for explicit command-line tools.

## Environment Setup

Keep two environments:

- **Development machine**: macOS or Linux for editing, Git, icon work, docs, and SDL debugging.
- **CardputerZero device**: real validation for APPLaunch registration, framebuffer, keyboard, fonts, install, run, and uninstall.

Common tools:

```bash
git
make
cmake
g++
pkg-config
dpkg-deb
aarch64-linux-gnu-g++
```

For VibAPP or lightweight LVGL work on the device, prefer the built-in APPLaunch template:

```text
/usr/share/APPLaunch/share/vibapp/templates/lvgl-basic-app
```

When cross-compiling on a development machine, confirm the output is Linux AArch64, not a local macOS or x86_64 SDL debug binary.

## Repository Roles

Common repositories:

- `CardputerZero/Launcher`: launcher and APPLaunch core logic.
- `M5CardputerZero-APPLaunch`: APPLaunch integration, example projects, and simulator/debug entry points.
- `CardputerZero/AppStore`: on-device AppStore logic: registry fetch, details, install, run, and uninstall.
- `CardputerZero/packages`: `.deb` package repository and package metadata.
- `CardputerZero/cardputerzero.github.io`: website, static registry, documentation center, and GitHub Pages publishing.
- `CardputerZero/skill`: project knowledge and constraints for Codex / AI workflows.
- Independent app repositories: each app's source, README, license, release, and build scripts.

An app is usually developed in its own repository, packaged as a `.deb`, and then published through packages or registry into the AppStore.

## Development Pattern

Recommended order:

1. Define app name, slug, icon, and launch mode.
2. Write `.desktop` early and confirm `Name`, `Exec`, `Icon`, and `Terminal=false`.
3. Design for 320 x 170 first instead of shrinking a desktop UI.
4. Build one GUI screen, one back action, and one exit path.
5. Handle keyboard input: short Esc returns or closes a modal; long Esc or Home exits.
6. Handle fonts: mixed Chinese, Japanese, and English needs CJK-capable fonts.
7. Handle framebuffer: respect `LV_LINUX_FBDEV_DEVICE`; do not hard-code `/dev/fb0`.
8. Package into the `/usr/share/APPLaunch` layout.
9. Validate icon, launch, exit, and uninstall on device.
10. Prepare AppStore metadata, MD5, screenshots, and pull request.

## Minimal APPLaunch Layout

A minimal package usually contains:

```text
applaunch/
  applications/
    helloworld.desktop
  bin/
    helloworld
  share/
    images/
      helloworld.png
    font/
```

Minimal `.desktop`:

```ini
[Desktop Entry]
Name=HelloWorld
Exec=bin/helloworld
Terminal=false
Icon=share/images/helloworld.png
Type=Application
```

`Exec=bin/helloworld` resolves under `/usr/share/APPLaunch`. If arguments or environment setup are needed, do not put a complex shell command in `Exec`; use a wrapper instead:

```sh
#!/bin/sh
export LV_LINUX_FBDEV_DEVICE="${LV_LINUX_FBDEV_DEVICE:-/dev/fb1}"
exec /usr/share/APPLaunch/bin/helloworld.bin
```

## HelloWorld Steps

1. Create an app directory such as `projects/HelloWorld`.
2. Prepare a 1:1 PNG icon such as `assets/helloworld.png`.
3. Create one 320 x 170 LVGL screen with a title and a status line.
4. Add keyboard input with at least one exit path.
5. Generate `applaunch/applications/helloworld.desktop`.
6. Use SDL locally to check layout.
7. Build the framebuffer version for the device.
8. Install under `/usr/share/APPLaunch`.
9. Restart or refresh APPLaunch and confirm the icon appears.
10. Launch, exit, and relaunch from APPLaunch.

## HelloWorld Acceptance Checklist

- Icon appears in APPLaunch.
- Title and body fit within 320 x 170.
- CJK text has no missing-glyph boxes.
- `Exec` points to a real executable.
- GUI uses `Terminal=false`.
- Exit returns to APPLaunch.
- The app does not depend on the wrong framebuffer device.
- `.deb` install and uninstall leave APPLaunch in the expected state.

## Next Steps

After HelloWorld, read:

- [App Submission Guide](#/documents/app-submission-guide): metadata, assets, MD5, and pull requests.
- [Registry And Web UI Requirements](#/documents/appstore-registry-requirements): registry fields and display rules.
- [Skill And AI Coding Guide](#/documents/skill-ai-coding-guide): use AI to apply the development pattern above.
