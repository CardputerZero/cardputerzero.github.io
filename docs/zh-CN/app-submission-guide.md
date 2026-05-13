# CardputerZero 应用提交指南

本指南说明开发者如何把应用提交到 CardputerZero Hub 和真机 AppStore registry。

## 总览

提交不是直接上传一个二进制文件，而是通过 GitHub Pull Request 提交应用元信息。维护者审核通过后，GitHub Actions 会生成静态 registry，并由 GitHub Pages 发布。

简化流程：

1. 在自己的 GitHub 仓库开发并发布应用。
2. 打包为 Debian `.deb`。
3. 在 CardputerZero 真机上安装和验证。
4. Fork `CardputerZero/cardputerzero.github.io`。
5. 添加应用 metadata 和展示素材。
6. 提交 Pull Request，等待 CI 和维护者审核。

## 提交前准备

应用仓库应包含：

- 源码，或明确说明是 binary-only。
- README，包括用途、构建方式、运行假设和限制。
- License。
- 稳定 release 或下载地址。
- `arm64` Debian `.deb`。
- 图标，推荐提供截图。
- 真机验证说明。

AppStore 以后只安装 Debian `.deb`。registry 必须提供下载地址、Debian package 名称和 MD5。

## APPLaunch 要求

CardputerZero 应用要能从 APPLaunch 正常启动。

- `.desktop` 至少包含 `[Desktop Entry]`、`Name`、`Exec`。
- GUI 应用默认 `Terminal=false`。
- 图标路径必须可读。
- 安装路径应符合 `/usr/share/APPLaunch` 约定。
- 应用必须有清晰退出方式。
- GUI 应适配 320 x 170 屏幕。

framebuffer 应用应尊重 `LV_LINUX_FBDEV_DEVICE`，不要直接假设 `/dev/fb0`。CardputerZero 小屏实际可能是 `/dev/fb1`。

## 真机验证

提交前至少验证：

- APPLaunch 中能看到图标和名称。
- 应用可以从 APPLaunch 启动。
- UI 没有超出屏幕。
- 键盘、Esc、Home 或强退路径可用。
- 退出后能返回启动器。
- 卸载后入口被移除。
- 日志没有明显权限、framebuffer 或动态库错误。

## 仓库流程

1. Fork `CardputerZero/cardputerzero.github.io`。
2. 从 `main` 创建分支。
3. 新增或修改应用 metadata。
4. 添加图标和截图到对应 asset 目录。
5. 本地运行可用的校验脚本。
6. Push 分支。
7. 向上游仓库发起 Pull Request。

## Metadata 必填信息

每个应用至少需要：

- 稳定 UUID。
- 唯一分享码。
- 标题和简介。
- GitHub 作者 ID。
- 版本、license、分类。
- 源码开放程度和源码仓库地址。
- Debian package 名。
- `.deb` 下载 URL。
- MD5 checksum。
- 权限、隐私、外部硬件、后台服务、HDMI 和商业使用限制。
- 已知风险和审核状态。

## Pull Request 内容

PR 描述应包含：

- 应用用途。
- 下载来源。
- 真机测试结果。
- 是否使用网络、文件系统、麦克风、外部硬件或后台服务。
- 已知风险或实验性限制。

CI 通过不代表自动上架。维护者仍会检查用户体验、设备安全、隐私和合规风险。
