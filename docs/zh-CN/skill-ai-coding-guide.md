# Skill 与 AI Coding 开发指南

这篇文档说明如何把 `cardputer-zero-application` skill 当作 CardputerZero 应用开发的操作手册，而不是只把 AI 当成代码补全工具。目标是让 AI 在写代码前先对齐 APPLaunch、LVGL、Debian 打包、framebuffer 和真机验证约束。

## 适用场景

- 新建或移植 CardputerZero 应用。
- 修复 APPLaunch 启动、图标、`.desktop`、退出或键盘问题。
- 打包 AArch64 Debian `.deb`。
- 准备 AppStore registry 元信息。
- 在真机上验证 `/usr/share/APPLaunch`、`LV_LINUX_FBDEV_DEVICE`、安装、运行和卸载流程。

## 推荐协作方式

开发前先明确告诉 AI：

```text
请使用 cardputer-zero-application skill。
目标：开发一个 CardputerZero APPLaunch 应用。
要求：320x170 GUI，Terminal=false，支持从 APPLaunch 启动和退出，打包为 arm64 .deb。
请先列出约束、目录、测试点和风险，再改代码。
```

这个提示会把 AI 的注意力拉到设备契约上，避免直接从桌面 Linux 或普通 Web 应用习惯开始写。

## AI 开发流程

1. 读取现有项目结构。
2. 确认应用类型：LVGL GUI、SDL GUI、CLI 工具或后台服务。
3. 确认 APPLaunch 入口：`.desktop` 的 `Name`、`Exec`、`Icon`、`Terminal`。
4. 确认安装路径：`/usr/share/APPLaunch/applications`、`bin`、`share/images`、`share/font`。
5. 确认 framebuffer 策略：尊重 `LV_LINUX_FBDEV_DEVICE`，不要硬编码 `/dev/fb0`。
6. 实现或修改代码。
7. 本地构建并生成 `.deb`。
8. 拷贝到真机安装。
9. 从 APPLaunch 启动、退出、重新进入，并检查日志。
10. 整理 registry metadata、MD5 和提交说明。

## 关键设备约束

CardputerZero 小屏 GUI 通常是 320 x 170。界面要避免桌面式大间距和过长文本，重要操作需要适配键盘。

APPLaunch 应用通常需要：

- GUI 应用 `Terminal=false`。
- `.desktop` 至少包含 `[Desktop Entry]`、`Name`、`Exec`。
- 图标路径能被 APPLaunch 读取。
- 应用能正常返回启动器。
- CJK 界面使用可用的中文或日文字体。

framebuffer 应用必须谨慎处理设备号。真机小屏实际可能是 `/dev/fb1`，所以应用应读取 `LV_LINUX_FBDEV_DEVICE`，或者由启动环境统一注入。

## 让 AI 先做的检查

在让 AI 改代码前，要求它输出这几项：

- 当前项目入口文件和构建命令。
- `.desktop` 文件是否存在，字段是否完整。
- 安装路径是否符合 APPLaunch 约定。
- 是否硬编码 `/dev/fb0`。
- 是否有 CJK 字体问题。
- Esc、Home、退出和异常关闭是否处理。
- Debian 包内文件清单。
- registry metadata 中需要声明的权限和风险。

## 常用任务提示

### 新建应用

```text
使用 cardputer-zero-application skill，帮我创建一个 CardputerZero LVGL 应用。
先给出 APPLaunch 目录、.desktop、framebuffer、键盘和打包计划。
然后实现最小可运行版本，并准备 .deb 打包脚本。
```

### 修复启动问题

```text
使用 cardputer-zero-application skill，检查这个应用为什么不能从 APPLaunch 启动。
重点看 .desktop、Exec 路径、权限、动态库、framebuffer、日志和返回启动器行为。
```

### 准备提交 AppStore

```text
使用 cardputer-zero-application skill，基于这个应用生成 AppStore metadata 草稿。
必须包含 UUID、share code、作者、版本、.deb URL、package、MD5、权限、隐私、风险和真机验证说明。
```

## 真机验收清单

- 安装 `.deb` 后 APPLaunch 出现应用图标。
- 图标、应用名和 `.desktop` 入口正确。
- 从 APPLaunch 启动成功。
- UI 不超出 320 x 170。
- 键盘操作可用。
- 退出后能返回 APPLaunch。
- 重新启动不残留异常进程。
- 卸载后 APPLaunch 入口被移除。
- 日志中没有 framebuffer、权限或动态库错误。

## 提交前输出

完成开发后，让 AI 给出提交摘要：

- 修改了哪些文件。
- 如何构建 `.deb`。
- 如何计算 MD5。
- 真机测试了哪些项目。
- AppStore metadata 还有哪些字段需要人工确认。

这个摘要可以直接进入 Pull Request 描述，减少维护者来回追问。
