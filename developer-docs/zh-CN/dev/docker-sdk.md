# 构建环境搭建

使用 Docker 在 **任何操作系统**（Windows、macOS、Linux）上编译 CardputerZero 应用。

## 前置要求

1. 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Windows/macOS）或 Docker Engine（Linux）
2. 安装 [Git](https://git-scm.com/)

## 第一步：克隆 AppBuilder

```bash
git clone https://github.com/CardputerZero/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
```

## 第二步：编译示例

```bash
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/SDL2_HelloWorld
```

## 第三步：部署到设备

```bash
scp dist/sdl2-hello_*.deb pi@192.168.x.x:/tmp/
ssh pi@192.168.x.x "sudo dpkg -i /tmp/sdl2-hello_*.deb"
```

应用立即出现在 APPLauncher 主界面。

## 创建自己的应用

```bash
cp -r examples/SDL2_HelloWorld examples/MyGame
# 编辑 packaging/meta.env, packaging/build.sh, packaging/stage.sh
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-deb.sh examples/MyGame
```

详细说明请参考[英文版](/dev/docker-sdk)。
