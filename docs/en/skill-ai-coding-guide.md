# Skill And AI Coding Guide

This document explains how to use the `cardputer-zero-application` skill as an operating guide for CardputerZero app development. The goal is to make AI align with APPLaunch, LVGL, Debian packaging, framebuffer behavior, and device validation before it starts changing code.

## When To Use It

- Build or port a CardputerZero app.
- Fix APPLaunch launch, icon, `.desktop`, exit, or keyboard behavior.
- Package an AArch64 Debian `.deb`.
- Prepare AppStore metadata, store assets, and `czdev publish` materials.
- Validate `/usr/share/APPLaunch`, `LV_LINUX_FBDEV_DEVICE`, installation, launch, and uninstall on a device.

## Recommended Prompt

Start development with a constraint-setting prompt:

```text
Use the cardputer-zero-application skill.
Goal: build a CardputerZero APPLaunch app.
Requirements: 320x170 GUI, Terminal=false, launches and exits from APPLaunch, packaged as arm64 .deb.
List constraints, directories, validation checks, and risks before editing code.
```

This keeps AI from applying generic desktop Linux assumptions to the device.

## AI Development Flow

1. Inspect the project structure.
2. Identify app type: LVGL GUI, SDL GUI, CLI utility, or background service.
3. Confirm APPLaunch entry: `.desktop` `Name`, `Exec`, `Icon`, and `Terminal`.
4. Confirm install paths: `/usr/share/APPLaunch/applications`, `bin`, `share/images`, and `share/font`.
5. Confirm framebuffer strategy: respect `LV_LINUX_FBDEV_DEVICE`; do not hard-code `/dev/fb0`.
6. Implement the requested change.
7. Build locally and produce a `.deb`.
8. Copy the package to the device and install it.
9. Launch, exit, relaunch, and check logs.
10. Run the prepublish check and prepare metadata, MD5, screenshots, and `czdev publish` notes.

## Device Constraints

CardputerZero GUI apps target a compact 320 x 170 screen. Avoid desktop spacing and long labels. Important actions should be reachable from the keyboard.

APPLaunch apps normally require:

- GUI apps use `Terminal=false`.
- `.desktop` includes at least `[Desktop Entry]`, `Name`, and `Exec`.
- Icon paths are readable by APPLaunch.
- The app returns cleanly to the launcher.
- CJK interfaces use available Chinese or Japanese fonts.

Framebuffer apps must not assume the wrong device. The small LCD can be `/dev/fb1`, so apps should read `LV_LINUX_FBDEV_DEVICE` or rely on the launcher environment to inject it.

## Ask AI To Check First

Before code edits, ask AI to report:

- Entry files and build command.
- Whether `.desktop` exists and has required fields.
- Whether install paths match APPLaunch conventions.
- Whether `/dev/fb0` is hard-coded.
- Whether CJK fonts are handled.
- Esc, Home, exit, and force-close behavior.
- Debian package file list.
- Registry permissions and risks that must be declared.

## Common Prompts

### New App

```text
Use the cardputer-zero-application skill to create a CardputerZero LVGL app.
First produce the APPLaunch directory, .desktop, framebuffer, keyboard, and packaging plan.
Then implement a minimal runnable app and Debian packaging script.
```

### Launch Failure

```text
Use the cardputer-zero-application skill to debug why this app does not launch from APPLaunch.
Focus on .desktop, Exec path, permissions, shared libraries, framebuffer, logs, and return-to-launcher behavior.
```

### AppStore Submission

```text
Use the cardputer-zero-application and cardputer-app-publish skills to prepare this app for AppStore publishing.
Check the app-builder.json store section, icon, four 320x170 screenshots, .deb control fields, APPLaunch .desktop, package name, MD5, and device validation notes.
After the strict prepublish check passes, provide the czdev login / bump / publish commands.
```

## Device Acceptance Checklist

- App icon appears after installing the `.deb`.
- Icon, app name, and `.desktop` entry are correct.
- Launch from APPLaunch succeeds.
- UI stays within 320 x 170.
- Keyboard interaction works.
- Exit returns to APPLaunch.
- Relaunch leaves no stale broken process.
- Uninstall removes the APPLaunch entry.
- Logs show no framebuffer, permission, or shared-library errors.

## Submission Output

After implementation, ask AI to summarize:

- Files changed.
- How to build the `.deb`.
- How MD5 was calculated.
- Whether the prepublish check passed.
- Which `czdev publish --deb <file.deb>` command should be run.
- Which device checks passed.
- Which metadata fields still need manual confirmation.

That summary can be reused in the pull request body.
