# CardputerZero Application Development Guidelines

## Metadata

- deb package filename: `packagename_version-revision_arm64.deb`

The same metadata rules are enforced on both submission channels (the developer portal web upload and `czdev publish`). Submissions that fail validation are rejected automatically with a report explaining what to fix.

Required fields:

- Application name (`app_name` / store title): Keep it as short as possible. It is displayed in the CardputerZero launcher and store. Must be unique in the store.
- Package name (`package_name`): A valid Debian package name — lowercase letters, digits, `.`, `+`, `-` only; no spaces or underscores. This is the stable identifier and cannot be changed after first publish.
- Version (`version`)
- Summary (`store.summary`): A one-line description. English is the default; Japanese and Chinese overrides go in `store.locales`.
- Icon (`store.icon`): Square PNG between 128×128 and 512×512 (256×256 recommended; automatically scaled where needed). Icons with built-in rounded corners or borders are not recommended.
- Screenshots (`store.screenshots`): PNG, exactly 320×170 (CardputerZero screen size). At least one is required; multiple are recommended.
- Categories (`store.categories`): 1–2 categories from the category list below.
- Permissions (`store.permissions`): All seven declarations listed below, each explicitly `true` or `false`.
- Author (`store.author`): An object; `display_name` is required, `github` / `email` / `website` are optional.
- License (`store.license`): An SPDX identifier such as `MIT` or `GPL-3.0-only`.
- Share code (`store.share_code`): Exactly 4 letters/digits (A–Z, 0–9), used for quickly finding the application in the store. Must be globally unique; do not change it after first publish.

Optional fields:

- Long description (`store.description`) and localized texts (`store.locales`).
- Open source URL (`store.source_repo`): Strongly recommended.

First-time submissions of a **new** package are held for manual review and require a short demo video (posted in the submission's pull request). Updates to already-published packages are validated and merged automatically.

Example `app-builder.json`: 

```
{
  "app_name": "Your App",
  "package_name": "your-app",
  "version": "0.0.1",

  "store": {
    "summary": "Your app in one line",
    "description": "A longer description of what your app does.",
    "locales": {
      "ja": { "summary": "あなたのアプリの説明" },
      "zh-CN": { "summary": "你的应用的描述" }
    },
    "icon": "assets/images/your_app_icon.png",
    "screenshots": ["assets/images/screenshot01.png", "assets/images/screenshot02.png"],
    "categories": ["Games"],
    "permissions": {
      "camera": false,
      "microphone": false,
      "imu": false,
      "network": false,
      "additional_hardware": false,
      "background_service": false,
      "external_display": false
    },
    "author": { "display_name": "Your Name", "github": "your-github-login" },
    "source_repo": "https://github.com/YourGitHubHandle/YourAppRepo",
    "license": "MIT",
    "share_code": "YOUR"
  }
}
```

### Categories

Each application must select 1-2 categories from the following category list.

| No. | Category          | Description                                                                                                                                                   |
| :---: | :---------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | System Tools      | Apps for system settings, file management, status monitoring, device maintenance and other general-purpose functions.                                         |
| 02  | Development       | Tools for code editing, running scripts, terminal operations, software debugging, log analysis, app development, and technical demonstrations.                |
| 03  | Hardware & IoT    | Apps for connecting to and controlling sensors, actuators, USB peripherals, Grove/EXT modules, and other IoT devices.                                         |
| 04  | Security          | Tools for authorized security testing, traffic analysis, protocol inspection, vulnerability verification, system diagnostics, and troubleshooting.            |
| 05  | Radio & Comms     | Apps for Wi-Fi, Bluetooth, infrared, LoRa, SDR, amateur radio, remote terminals, and other wireless communications.                                           |
| 06  | AI                | Apps that provide voice interaction, intelligent conversations, image recognition, local models, content generation, translation, and intelligent automation. |
| 07  | Creative & Office | Apps for note-taking, writing, task management, document processing, drawing and design, and other creative or productivity workflows.                        |
| 08  | Media             | Apps for photography, video recording, audio recording, music playback, audio/video processing, media streaming, and media file management.                   |
| 09  | Games             | Native games and apps offering puzzle, action, strategy, multiplayer, and other casual entertainment experiences.                                             |
| 10  | Emulators         | Apps that emulate game consoles, handhelds, computers, electronic devices, or other software and hardware environments.                                       |
| 11  | Education         | Apps for learning programming and languages, electronics and maker education, scientific exploration, knowledge lookup, and reading reference materials.      |
| 12  | Lifestyle         | Apps for weather, clocks, reminders, health, travel, life logging, and other everyday personal services.                                                      |
| 13  | Other             | Apps and tools that do not fit into the categories above.                                                                                                     |

### Permissions and Requirements

Each application must declare whether it requires the following requirements: 

- Access to the camera
- Access to the microphone
- Access to IMU
- Use network connection
- Requires external hardware
- Can continue running in the background
- Supports external displays

Applications that run with root privileges are not allowed to be published.

## Fonts

The system has the following fonts installed. It is recommended to use them first: 

- For Western scripts (Latin, Greek, Cyrillic, etc.): DejaVu Sans / Serif
- For terminals and code: JetBrains Mono
- For CJK (Chinese, Japanese, Korean): Noto CJK Sans / Serif (make sure to select the correct regional language variant)

To ensure good display quality, it is recommended to use a font size of 12px or larger and Regular or heavier font weights in most interfaces.

## File Storage Location

Configuration files: `$HOME/.config/YourApp/`
