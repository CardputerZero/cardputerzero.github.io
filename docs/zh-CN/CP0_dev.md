# CardputerZero 应用开发规范

## 元数据

- deb 安装包文件名：`packagename_version-revision_arm64.deb`

两个提交渠道（开发者门户网页上传与 `czdev publish`）执行同一套元数据校验规则。校验不通过的提交会被自动拒绝，并附带说明如何修复的报告。

必填字段：

- 应用名称（`app_name` / 商店显示名）：尽量简短，显示在 CardputerZero 启动器及商店，在商店内必须唯一。
- 包名（`package_name`）：合法的 Debian 包名——仅允许小写字母、数字、`.`、`+`、`-`，不能有空格或下划线。这是稳定标识符，首次发布后不可更改。
- 版本号（`version`）
- 简介（`store.summary`）：一句话描述。默认英文，日文与中文写在 `store.locales` 中。
- 图标（`store.icon`）：正方形 PNG，128×128 到 512×512（推荐 256×256，各处会自动缩放至所需尺寸），不建议图标自带圆角、边框。
- 截图（`store.screenshots`）：PNG，尺寸必须为 320×170（CardputerZero 屏幕尺寸）。至少 1 张，推荐多张。
- 分类（`store.categories`）：从下方分类枚举中选择 1~2 个。
- 权限（`store.permissions`）：下方 7 项声明必须全部给出，每项显式填 `true` 或 `false`。
- 作者（`store.author`）：对象格式；`display_name` 必填，`github` / `email` / `website` 可选。
- 许可证（`store.license`）：SPDX 标识符，如 `MIT`、`GPL-3.0-only`。
- 商店分享码（`store.share_code`）：4 位字母或数字（A–Z、0–9），用于快速查找应用。全商店唯一，首次发布后不要更改。

可选字段：

- 详细描述（`store.description`）与本地化文案（`store.locales`）。
- 开源地址（`store.source_repo`）：强烈建议填写。

**新应用**首次提交会进入人工审核，需在提交对应的 Pull Request 中附一段简短的演示视频；已上架应用的版本更新通过校验后自动合并上架。

示例 `app-builder.json`：

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

### 分类

每个应用必须从以下分类枚举中选择 1~2 个。

| 编号 | 分类名称                          | 分类描述                                                                            |
| :---: | :-------------------------------: | ----------------------------------------------------------------------------------- |
| 01   | System Tools<br>（系统工具）      | 用于系统设置、文件管理、状态监控、设备维护及其他通用功能的应用。                    |
| 02   | Development<br>（编程开发）       | 用于代码编辑、脚本运行、终端操作、软件调试、日志分析、应用开发及技术演示的工具。    |
| 03   | Hardware & IoT<br>（硬件物联）    | 用于连接和控制传感器、执行器、USB 外设、Grove／EXT 模块及其他物联网设备的应用。     |
| 04   | Security<br>（安全测试）          | 用于经授权的网络安全测试、流量分析、协议检查、漏洞验证、系统诊断及故障排查的工具。  |
| 05   | Radio & Comms<br>（无线通信）     | 用于 Wi-Fi、蓝牙、红外线、LoRa、SDR、业余无线电、远程终端及其他无线通信场景的应用。 |
| 06   | AI<br>（人工智能）                | 提供语音交互、智能对话、图像识别、本地模型、内容生成、翻译及智能自动化功能的应用。  |
| 07   | Creative & Office<br>（创作办公） | 用于笔记、写作、任务、文档处理、绘画设计及其他内容创作和效率提升场景的应用。        |
| 08   | Media<br>（影音媒体）             | 用于摄影、录像、录音、音乐播放、音视频处理、媒体串流及媒体文件管理的应用。          |
| 09   | Games<br>（游戏娱乐）             | 提供益智、动作、策略、多人互动及其他休闲娱乐体验的原生游戏和应用。                  |
| 10   | Emulators<br>（模拟器）           | 用于模拟游戏主机、掌机、电脑、电子设备或其他软硬件运行环境的应用。                  |
| 11   | Education<br>（学习教育）         | 用于编程学习、语言学习、电子与创客教育、科学探索、知识查询及参考资料阅读的应用。    |
| 12   | Lifestyle<br>（日常生活）         | 用于天气、时钟、提醒、健康、出行、生活记录及其他个人日常服务的应用。                |
| 13   | Other<br>（其他）                 | 其他类型的应用和工具，包含无法归入以上分类的内容。                                  |

### 权限与运行要求

每个应用必须声明是否需要以下各项要求：

- 访问摄像头
- 访问麦克风
- 访问 IMU
- 使用网络
- 需要外部硬件
- 可在后台持续运行
- 支持外接显示器

禁止上架以 root 权限运行的 app。

## 字体

系统已安装以下字体，建议优先使用：

- 用于西文（拉丁字母、希腊字母、西里尔字母等）：DejaVu Sans / Serif
- 用于终端、代码：JetBrains Mono
- 用于 CJK 中日韩文：Noto CJK Sans / Serif（注意正确选择地区语言变体）

为保证良好的显示效果，推荐在大多数界面使用 12px 及更大的字号、Regular 及更粗的字重。

## 文件存放位置

设置文件：`$HOME/.config/YourApp/`
