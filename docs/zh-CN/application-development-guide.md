# CardputerZero 应用开发入门

这篇文档面向普通开发者，说明如何从零开始理解 CardputerZero 应用开发。AI Coding 可以提高效率，但不是前提；先理解运行环境、仓库定位、APPLaunch 约定和最小 HelloWorld，会更容易判断后续生成代码是否正确。

## 使用语言

推荐优先级：

- **C/C++ + LVGL 9.5**：默认推荐方案，适合 320 x 170 小屏 GUI、键盘输入和 framebuffer。
- **C/C++ + SDL**：适合桌面调试，最终仍要切到 Linux framebuffer。
- **Shell wrapper**：用于设置环境变量、切换工作目录、传递参数或注入 `LV_LINUX_FBDEV_DEVICE`。
- **Python / Node / 其他语言**：可以用于工具、后台服务或原型，但提交前要确认依赖、启动速度、内存、字体和退出行为。

GUI 应用默认按 `Terminal=false` 设计。只有明确是命令行工具时才使用 `Terminal=true`。

## 环境搭建

建议准备两套环境：

- **开发机环境**：macOS 或 Linux，用于编辑代码、Git、生成图标、写文档、做 SDL 本地调试。
- **CardputerZero 真机环境**：用于验证 APPLaunch 注册、framebuffer、键盘、字体、安装、运行和卸载。

常用工具：

```bash
git
make
cmake
g++
pkg-config
dpkg-deb
aarch64-linux-gnu-g++
```

如果使用 AppBuilder 工作流，建议安装 `czdev`：

```bash
git clone --recursive git@github.com:m5stack/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
cargo build --release -p czdev
./target/release/czdev doctor
```

`czdev run` 和 `czdev watch` 可用于桌面模拟器调试；`czdev deploy --host pi@<device-ip> --deb <file.deb>` 可把构建好的 `.deb` 推到真机；发布到 AppStore 前使用 `czdev login` 和 `czdev publish --deb <file.deb>`。

如果在真机上开发 VibAPP 或轻量 LVGL 应用，优先使用 APPLaunch 内置模板：

```text
/usr/share/APPLaunch/share/vibapp/templates/lvgl-basic-app
```

如果在开发机上交叉编译，确保构建产物是 Linux AArch64，而不是本地 macOS 或 x86_64 SDL 调试二进制。

## Git 仓库定位

常见仓库职责：

- `CardputerZero/Launcher`：启动器和 APPLaunch 主逻辑。
- `M5CardputerZero-APPLaunch`：APPLaunch 相关集成、示例项目和模拟器调试入口。
- `CardputerZero/AppStore`：真机 AppStore 应用逻辑，包含 registry 拉取、详情、安装、运行、卸载等能力。
- `CardputerZero/packages`：`.deb` 包仓库，保存可安装包和包元信息。
- `CardputerZero/cardputerzero.github.io`：官网、静态 registry、文档中心和 GitHub Pages 发布。
- `CardputerZero/skill`：给 Codex / AI 使用的项目经验和开发约束。
- 独立应用仓库：每个应用自己的源码、README、license、release 和构建脚本。

一个应用通常先在自己的仓库开发，再打包成 `.deb`，最后通过 packages 或 registry 进入 AppStore。

## 开发范式

推荐顺序：

1. 先定义应用名、slug、图标和运行方式。
2. 先写 `.desktop`，确认 `Name`、`Exec`、`Icon`、`Terminal=false`。
3. 以 320 x 170 为设计边界，不要从桌面尺寸缩小。
4. GUI 先做一个屏幕、一个返回键、一个退出路径。
5. 处理键盘输入：短 Esc 返回上一层或关闭弹窗，长 Esc 或 Home 能退出。
6. 处理字体：中文、日文、英文混排要使用 CJK 字体。
7. 处理 framebuffer：尊重 `LV_LINUX_FBDEV_DEVICE`，不要硬编码 `/dev/fb0`。
8. 打包到 `/usr/share/APPLaunch` 约定路径。
9. 在真机上验证 APPLaunch 图标、启动、退出和卸载。
10. 再准备 AppStore metadata、MD5、4 张 320 x 170 截图，并通过 `czdev publish` 提交 package PR。

## APPLaunch 最小目录

一个最小应用包通常包含：

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

最小 `.desktop`：

```ini
[Desktop Entry]
Name=HelloWorld
Exec=bin/helloworld
Terminal=false
Icon=share/images/helloworld.png
Type=Application
```

`Exec=bin/helloworld` 会相对 `/usr/share/APPLaunch` 解析。需要参数或环境变量时，不要把复杂命令直接写进 `Exec`，而是写 wrapper：

```sh
#!/bin/sh
export LV_LINUX_FBDEV_DEVICE="${LV_LINUX_FBDEV_DEVICE:-/dev/fb1}"
exec /usr/share/APPLaunch/bin/helloworld.bin
```

## HelloWorld 开发步骤

1. 新建应用目录，例如 `projects/HelloWorld`。
2. 准备 1:1 PNG 图标，例如 `assets/helloworld.png`。
3. 写一个 320 x 170 的 LVGL 页面，只显示标题和一行状态文本。
4. 接入键盘输入，至少支持退出。
5. 生成 `applaunch/applications/helloworld.desktop`。
6. 本地 SDL 调试看布局。
7. 真机 framebuffer 构建。
8. 安装到 `/usr/share/APPLaunch`。
9. 重启或刷新 APPLaunch，确认图标出现。
10. 从 APPLaunch 启动、退出、再次启动。

## HelloWorld 验收清单

- 图标能在 APPLaunch 中显示。
- 标题和正文没有溢出 320 x 170。
- CJK 文本没有方块字。
- `Exec` 指向真实可执行文件。
- GUI 使用 `Terminal=false`。
- 应用退出后能回到 APPLaunch。
- 不依赖错误的 framebuffer 设备。
- `.deb` 安装和卸载后 APPLaunch 状态正确。

## 下一步

完成 HelloWorld 后，再阅读：

- [应用提交指南](#/documents/app-submission-guide)：准备 `czdev`、metadata、assets、MD5、prepublish check 和 package PR。
- [Registry 和 Web UI 需求](#/documents/appstore-registry-requirements)：理解 registry 字段和页面展示规则。
- [Skill 与 AI Coding 开发指南](#/documents/skill-ai-coding-guide)：把上述开发范式交给 AI 辅助执行。
