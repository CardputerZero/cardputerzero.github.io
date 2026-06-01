# 架构概览

CardputerZero 运行完整 Linux 系统，配合针对 320×170 屏幕和 46 键键盘优化的应用层。

## 系统架构

```
┌─────────────────────────────────────────────────┐
│           APPLauncher (主界面)                   │  LVGL 9.x UI
├─────────────────────────────────────────────────┤
│              HAL 硬件抽象层 (C)                  │  显示、音频、输入、WiFi、蓝牙
├─────────────────────────────────────────────────┤
│         Linux 内核 + 设备树                      │  fbdev, libinput, I2S, SPI, I2C
├─────────────────────────────────────────────────┤
│         Raspberry Pi OS (Debian Bookworm)        │  systemd, apt, SSH, Python 3.11
├─────────────────────────────────────────────────┤
│      CM0 硬件 (BCM2710A1 Cortex-A53 ×4)         │  VideoCore IV, 512MB LPDDR2
└─────────────────────────────────────────────────┘
```

## 开发流程

```bash
# 1. 编写应用
vim main.c

# 2. 用 Docker SDK 编译（Windows/macOS/Linux 通用）
docker run --rm -v $(pwd):/src ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh MyApp

# 3. 部署到设备
scp dist/myapp_*.deb pi@<设备IP>:/tmp/
ssh pi@<设备IP> "sudo dpkg -i /tmp/myapp_*.deb"

# 4. 应用自动出现在主界面
```

## 快速链接

- [Docker SDK 环境搭建](/zh-CN/dev/docker-sdk) — **从这里开始**
- [Hello World](/zh-CN/dev/hello-world) — 最简示例
- [打包与部署](/zh-CN/dev/packaging) — 创建 .deb 包
- [技术规格](/zh-CN/dev/tech-specs) — 完整硬件参考
- [仓库索引](/zh-CN/dev/repositories) — 源码仓库一览
