# CardputerZero 应用提交指南

本指南说明当前如何把应用发布到 CardputerZero 真机 AppStore。

## 总览

推荐发布路径是使用 [CardputerZero-AppBuilder](https://github.com/m5stack/CardputerZero-AppBuilder) 里的 `czdev` CLI。开发者发布可安装的 `.deb` 包；`czdev` 会校验包结构，把 `.deb`、`meta.json`、图标和截图通过 Git LFS 推送到 `CardputerZero/packages`，并创建 Pull Request 给维护者审核。合并后 packages 仓库更新 APT 索引，官网再从 package metadata 同步生成 `generated/registry.json`。

简化流程：

1. 在自己的 GitHub 仓库开发应用。
2. 构建 ARM64 Debian `.deb`，包内文件符合 APPLaunch 约定。
3. 本地校验 package、metadata 和 store assets。
4. 首次发布前运行 `czdev login`。
5. 运行 `czdev publish --deb <package>`。
6. 检查 `CardputerZero/packages` 中生成的 Pull Request。
7. 等待维护者审核、APT 索引重建和 Hub registry 同步。

真机 AppStore 只允许安装 registry 中 `review.status` 为 `approved` 的应用。

## 安装和检查 `czdev`

构建或发布前先安装依赖。

macOS：

```bash
brew install cmake pkg-config sdl2 sdl2_image sdl2_mixer freetype git-lfs dpkg
```

Debian / Ubuntu：

```bash
sudo apt install -y build-essential cmake pkg-config \
  libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev libfreetype-dev \
  git-lfs dpkg
```

从源码构建 `czdev`：

```bash
git clone --recursive git@github.com:m5stack/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
cargo build --release -p czdev
./target/release/czdev doctor
```

如果仓库不是用 `--recursive` 克隆的：

```bash
git submodule update --init --recursive
```

也可以从 AppBuilder 的 GitHub Releases 下载当前平台的预构建 `czdev`，然后放到 `PATH`。安装后运行：

```bash
czdev doctor
```

`czdev doctor` 的输出是本机缺失依赖的准确信息来源。

常用开发命令：

```bash
czdev list .
czdev run examples/hello_cz
czdev watch examples/hello_cz
czdev deploy --host pi@<device-ip> --deb build/my_app_1.0.0_arm64.deb
```

## Package 要求

`.deb` 必须把 APPLaunch 应用安装到 `/usr/share/APPLaunch`。

包内至少应包含：

- `usr/share/APPLaunch/applications/<app>.desktop`
- `usr/share/APPLaunch/bin/` 下的可执行文件或 wrapper。
- `usr/share/APPLaunch/share/images/` 下的方形 PNG 图标。
- 需要的字体和素材放在 `usr/share/APPLaunch/share/`。

`.desktop` 至少包含：

```ini
[Desktop Entry]
Name=MyApp
Exec=bin/myapp
Terminal=false
Icon=share/images/myapp.png
Type=Application
```

GUI 应用使用 `Terminal=false`。如果需要参数、切换目录或设置 framebuffer 环境变量，写 wrapper 脚本，不要把复杂命令直接塞进 `Exec`。

## Store Metadata 和素材

应用源码仓库应包含带 `store` 段的 `app-builder.json`：

```json
{
  "package_name": "my-app",
  "app_name": "My App",
  "store": {
    "summary": "Short user-facing summary.",
    "categories": ["Utilities"],
    "icon": "share/images/my-app.png",
    "screenshots": [
      "store/screenshots/main.png",
      "store/screenshots/detail.png",
      "store/screenshots/settings.png",
      "store/screenshots/confirm.png"
    ],
    "locales": {
      "zh-CN": {
        "title": "我的应用",
        "summary": "简短中文简介。",
        "description": "面向中文用户的说明。"
      },
      "en": {
        "title": "My App",
        "summary": "Short English summary.",
        "description": "English description for users."
      },
      "ja": {
        "title": "マイアプリ",
        "summary": "短い日本語の説明。",
        "description": "日本語ユーザー向けの説明。"
      }
    }
  }
}
```

提交到 AppStore 的截图应是 4 张干净的 320 x 170 framebuffer 截图。不要包含模拟器窗口边框、设备外框、桌面背景、黑边或缩放留白。

复制到 `CardputerZero/packages` 的 package metadata 中，图片路径必须相对 `pool/main/<package>/`：

```json
{
  "icon": "my-app.png",
  "screenshots": [
    "screenshots/main.png",
    "screenshots/detail.png",
    "screenshots/settings.png",
    "screenshots/confirm.png"
  ],
  "published_at": "2026-05-14T23:20:55+08:00",
  "updated_at": "2026-05-14T23:20:55+08:00"
}
```

`published_at` 和 `updated_at` 必须是带秒和明确时区的 ISO 8601 时间。首次发布后尽量保持 `published_at` 稳定；当包版本、截图、图标、描述、权限或审核状态变化时更新 `updated_at`。

## 必跑的发布前检查

发布前从 `cardputer-app-publish` skill 目录运行严格检查：

```bash
python3 /path/to/cardputer-app-publish/scripts/prepublish_check.py \
  --deb build/my_app_1.0.1_arm64.deb \
  --app-dir .
```

所有 `ERROR` 都是阻塞项。检查内容包括：

- `app-builder.json` 存在并包含 `store` 段。
- `store.summary`、`store.categories`、`store.icon` 和截图齐全。
- 源图标和截图文件存在；图标必须是方形 PNG。
- `.deb` control 字段包含 `Package`、`Version`、`Architecture=arm64` 和 `Maintainer`。
- `.deb` 内有 APPLaunch `.desktop`，并包含 `Name`、`Exec`、`Icon`。
- `.desktop` 的 `Icon` 能解析到包内真实方形 PNG。
- `.desktop` 的 `Exec` 如果是绝对路径或 APPLaunch 相对路径，包内必须有对应可执行文件。

如果非交互发布交接中发现源图标缺失，应先生成图标、重建 `.deb`、重新检查。不要发布缺失 APPLaunch 图标的 `.deb`。

## 使用 `czdev` 发布

首次登录：

```bash
czdev login
```

这会使用 GitHub OAuth Device Flow，并把 token 存到 `~/.config/czdev/token`。

更新已有包时先查看下一个版本建议：

```bash
czdev bump --deb build/my_app_1.0.0_arm64.deb
```

发布：

```bash
czdev publish --deb build/my_app_1.0.1_arm64.deb
```

`czdev publish` 会执行 preflight，检查版本是否高于已发布版本，把 `.deb`、`meta.json`、图标和截图通过 Git LFS 推送，并向 `CardputerZero/packages` 创建 Pull Request。

删除自己发布过的某个版本：

```bash
czdev unpublish my-app --version 1.0.1
```

## 真机验证

创建或合并 package Pull Request 前，在 CardputerZero 真机上验证：

- package 能通过 `dpkg -i` 或 APT 安装。
- APPLaunch 中显示正确图标和名称。
- 应用能从 APPLaunch 启动并干净返回。
- GUI 适配 320 x 170 屏幕。
- CJK 文本使用可用字体，没有方块字。
- 短 Esc 返回上一层或关闭弹窗；长 Esc 或 Home 能安全退出。
- framebuffer 逻辑尊重 `LV_LINUX_FBDEV_DEVICE`，不硬编码 `/dev/fb0`。
- 权限、网络、外设和后台服务行为与 metadata 一致。
- 卸载后 APPLaunch 入口被移除。

## Pull Request 审核

PR 描述应说明：

- 应用用途。
- 测试设备和 OS 镜像。
- 是否已经从提交的 `.deb` 安装测试。
- 权限、网络、外设和后台服务行为。
- 隐私行为和数据保留策略。
- 已知限制。
- 源码、release、package、截图和测试日志链接。

CI 通过不代表自动上架。维护者仍会检查政策、风险、设备安全、用户体验和 metadata 质量。审核通过并合并后，packages 仓库会重建 APT 索引；官网再把 package `meta.json` 同步到 `generated/registry.json`，真机 AppStore 刷新后可见。

## 常见问题

| 问题 | 处理 |
| --- | --- |
| 找不到 `czdev` | 从 AppBuilder 源码构建，或下载 release 版并放到 `PATH`。 |
| `czdev doctor` 提示缺依赖 | 按输出安装当前 OS 缺失包，然后重新运行 `czdev doctor`。 |
| `git-lfs not installed` | 安装 Git LFS 并运行 `git lfs install`。 |
| 缺少 `dpkg-deb` | macOS: `brew install dpkg`；Debian/Ubuntu: `sudo apt install dpkg`。 |
| `email_mismatch` | 把 `.deb` 的 `Maintainer` email 改成 GitHub 账号 email 或 noreply 地址。 |
| `version_not_newer` | 提升 package 版本，重建 `.deb`，重新跑 prepublish check。 |
| `store.icon is required` | 增加或生成方形 PNG 图标，重建 `.deb`，重新跑严格检查。 |
| 网页已显示但真机不能安装 | 确认 registry `review.status` 为 `approved`，包 URL 可访问，package 名正确，MD5 和 `.deb` 一致。 |

相关规则见 [开发者提交规范](#/documents/developer-submission-policy)、[Registry 和 Web UI 需求](#/documents/appstore-registry-requirements) 和 [用户与开发者协议](#/documents/user-agreement)。
