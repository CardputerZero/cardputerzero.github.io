# CardputerZero 应用提交指南

CardputerZero Store 的应用提交及管理，有两种路径：

- 命令行工具 czdev（https://github.com/CardputerZero/AppBuilder）
- 开发者中心网站（https://dev.cardputer.cc/）

## 准备

### czdev

在你方便的位置，从 GitHub 克隆 AppBuilder 仓库：`git clone https://github.com/CardputerZero/AppBuilder.git`

![clone GitHub repo](assets/docs/Submit01_czdev_clone.png)

然后在 AppBuilder 仓库的根目录执行 `./czdev login`，将出现的八位数字字母验证码填入自动打开的 GitHub 验证网页，即可登录成功。

![czdev login](assets/docs/Submit02_czdev_login.png)
![czdev login](assets/docs/Submit03_czdev_login.png)

### 网站

浏览器打开开发者中心网站 https://dev.cardputer.cc/，点击登录按钮并授权，即可登录成功。

![web login](assets/docs/Submit04_web_login.png)
![web login](assets/docs/Submit05_web_login.png)

## 新应用上传

推荐以 https://github.com/CardputerZero/Template 为模板开始开发，也可以在 AppBuilder 仓库根目录执行 `./czdev new my-app` 自动从 Template 模板新建应用。

上传新应用前，请确保应用符合开发规范：https://cardputer.cc/#/documents/cp0-dev，并在实机上充分测试。准备好新应用的 `.deb` 安装包，开始上传。

### czdev

在新应用所在项目的根目录（`app-builder.json` 所在目录，不一定是 AppBuilder 仓库）执行 `./czdev publish --deb the_new_app.deb`。工具会检查该应用的安装包及相关文件是否符合规范，通过后在 https://github.com/CardputerZero/packages/pulls 新建一条 pull request。

![czdev publish](assets/docs/Submit06_czdev_publish.png)

### 网站

浏览器打开网站 https://dev.cardputer.cc/，点击上传按钮上传 `.deb` 安装包，完成解析后填入各项信息。点击上传，工具会检查该应用的安装包及所填信息是否符合规范，通过后在 https://github.com/CardputerZero/packages/pulls 新建一条 pull request。

![web publish](assets/docs/Submit07_web_publish.png)

请在该 PR 的评论区上传实机演示视频。视频仅供 Store 维护者审核，需要包含应用启动过程、主要功能演示、应用退出过程。没有实机演示视频的应用不会通过审核。

![PR video](assets/docs/Submit08_pr_video.png)

等待 Store 维护者审核通过 PR 后，应用即可出现在 Store 中供用户下载安装。

## 应用更新

待更新。

## 应用下架

待更新。
