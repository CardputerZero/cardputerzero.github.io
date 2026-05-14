# CardputerZero App Submission Guide

This guide describes the expected path for submitting an app to CardputerZero Hub and the on-device AppStore registry.

## Overview

Developers submit app metadata through GitHub Pull Requests. After maintainer approval, GitHub Actions generates the static registry files and GitHub Pages publishes the updated Hub.

The short version:

1. Build and publish your app in your own GitHub repository.
2. Package the app as a Debian `.deb` file.
3. Test the package on a CardputerZero device.
4. Fork the registry repository.
5. Add one app metadata file and matching assets.
6. Open a Pull Request and wait for CI plus maintainer review.

## Before You Submit

Your app repository should include:

- Source code or a clear statement that the app is binary-only.
- README with purpose, build instructions, runtime assumptions, and known limitations.
- License.
- Release or stable download location.
- A Debian `.deb` package for `arm64`.
- A stable app icon.
- Optional screenshots.
- Device validation notes.

AppStore installs only Debian `.deb` packages. The registry must include the package download URL, Debian package name, and MD5 checksum.

## Device Validation

Before opening a Pull Request, test the app on CardputerZero:

- App appears in APPLaunch with the expected icon and title.
- App starts from APPLaunch.
- GUI fits the 320 x 170 screen.
- Short back/escape behavior is documented.
- Long Home or equivalent force-exit behavior is safe.
- App does not assume the wrong framebuffer.
- Permissions, network behavior, external hardware, and background services match the submitted metadata.

For framebuffer applications, respect `LV_LINUX_FBDEV_DEVICE` when possible and avoid hard-coding `/dev/fb0`. On CardputerZero, the small ST7789V LCD is commonly `/dev/fb1`.

## Repository Workflow

1. Fork `CardputerZero/cardputerzero.github.io`.
2. Create a branch from `main`.
3. Add or edit the app metadata file.
4. Add the icon and screenshots under the matching asset directory.
5. Run any available validation locally if documented.
6. Push your branch.
7. Open a Pull Request to the upstream repository.

## Suggested Directory Layout

```text
cardputerzero.github.io/
  apps/
    <uuid>.yml
  assets/
    <uuid-prefix>/
      icon.png
      screenshots/
        main.png
  generated/
    registry.json
    registry-index.json
  docs/
  site/
```

The current repository may generate some registry files from maintainer-owned source data. Follow the existing project layout in the repository and keep app assets in the matching app asset directory.

## Required Metadata

Each app entry should provide:

- Stable UUID.
- Unique share code.
- Title and summary.
- Author GitHub ID.
- Version.
- License.
- Categories.
- Source openness and repository URL if available.
- Debian package metadata.
- Download URL.
- MD5 checksum.
- Permissions.
- Privacy behavior.
- External hardware requirements.
- Background service behavior.
- HDMI behavior.
- Commercial-use restrictions.
- Known risk flags.
- Review status.

## Metadata Example

```yaml
schema_version: 1
uuid: "123e4567-e89b-12d3-a456-426614174000"
title: "My Cardputer App"
summary: "One sentence user-facing summary."
description: "Longer description for the detail page."
categories:
  - Utilities
device_targets:
  - CardputerZero
author:
  github: "your-github-id"
version: "1.0.0"
license: "MIT"
source:
  openness: "open-source"
  repository: "https://github.com/your-github-id/my-cardputer-app"
download:
  type: "deb"
  package: "my-cardputer-app"
  url: "https://github.com/your-github-id/my-cardputer-app/raw/main/dist/my-cardputer-app_1.0.0_arm64.deb"
  md5: "..."
permissions:
  network: false
  microphone: false
  filesystem: "app-data-only"
privacy:
  collects_personal_data: false
  data_retention: "none"
assets:
  icon: "assets/123e4567/icon.png"
  screenshots:
    - "assets/123e4567/screenshots/main.png"
review:
  status: "pending"
```

## Pull Request Description

The Pull Request should explain:

- What the app does.
- Which device and OS image you tested on.
- Whether it has been installed from the submitted `.deb`.
- Any permissions or external hardware it needs.
- Any privacy, network, storage, or background-service behavior.
- Known limitations.
- Links to source, release, and package.

## Automated Checks

GitHub Actions may check:

- UUID format and uniqueness.
- Share-code uniqueness.
- Required fields.
- Icon and screenshot paths.
- Download URL availability.
- Debian package fields.
- MD5 checksum.
- Registry generation.
- Basic source or package checks when available.

Passing CI does not guarantee listing. Maintainers still review policy, risk, device safety, and user experience.

## Review Outcomes

Maintainers may:

- Approve and merge.
- Request metadata changes.
- Request package or app changes.
- Ask for test logs or screenshots.
- Mark the app experimental or high risk.
- Reject, delist, deprecate, or block the app.

See [Developer Submission Policy](#/documents/developer-submission-policy) and [User And Developer Agreement](#/documents/user-agreement) for the rules behind these decisions.
