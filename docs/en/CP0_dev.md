# CardputerZero Application Development Guidelines

## Metadata

- deb package filename: `packagename_version-revision_arm64.deb`

- Application name: Keep it as short as possible. It is displayed in the CardputerZero launcher and store.
- Package name: Use lowercase letters only. Spaces are not allowed. Hyphens (-) can be used as separators.
- Icon: PNG format, size 256*256 (automatically scaled to required sizes in different places). Icons with built-in rounded corners or borders are not recommended.
- Version
- Screenshots: Size 320*170 (CardputerZero screen size). Multiple screenshots are recommended.
- Description: English is the default. Japanese and Chinese are also supported.
- Category: Must select 1-2 categories from the category list below.
- Permissions and requirements: The application must declare whether it requires each of the requirements listed below.
- Author
- Author email
- Open source URL
- License
- Store sharing code: Four letters or numbers, used for quickly finding the application in the store.

Example `app-builder.json`: 

```
{
  "app_name": "Your App",
  "package_name": "your_app",
  "icon": "assets/images/your_app_icon.png",
  "version": "0.0.1",
  "screenshots": ["assets/images/screenshot01.png", "assets/images/screenshot02.png", "assets/images/screenshot03.png"],
  "description": {
    "en": "Your app description",
    "ja": "あなたのアプリの説明",
    "zh-CN": "你的应用的描述"
  },
  "categories": ["Category1", "Category2"],
  "permissions": {
    "camera": false,
    "microphone": false,
    "imu": false,
    "network": false,
    "additional_hardware": false,
    "background_service": false,
    "external_display": false
  },
  "author": "Your Name",
  "author_mail": "Your Mail",
  "source_repo": "https://github.com/YourGitHubHandle/YourAppRepo",
  "license": "YourLicense",
  "share_code": "YOUR"
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
