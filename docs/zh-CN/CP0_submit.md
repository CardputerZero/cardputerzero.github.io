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

在新应用所在项目的根目录（`app-builder.json` 所在目录，不一定是 AppBuilder 仓库）执行 `the_path_of_AppBuilder/czdev publish --deb the_new_app.deb`。工具会检查该应用的安装包及相关文件是否符合规范，通过后在 https://github.com/CardputerZero/packages/pulls 新建一条 pull request。

![czdev publish](assets/docs/Submit06_czdev_publish.png)

### 网站

浏览器打开网站 https://dev.cardputer.cc/，点击上传按钮上传 `.deb` 安装包，完成解析后填入各项信息。点击上传，网站会检查该应用的安装包及所填信息是否符合规范，通过后在 https://github.com/CardputerZero/packages/pulls 新建一条 pull request。

![web publish](assets/docs/Submit07_web_publish.png)

请在该 PR 的评论区上传实机演示视频。视频仅供 Store 维护者审核，需要包含应用启动过程、主要功能演示、应用退出过程。没有实机演示视频的应用不会通过审核。

![PR video](assets/docs/Submit08_pr_video.png)

等待 Store 维护者审核通过 PR 后，应用即可出现在 Store 中供用户下载安装。

## 应用更新

### czdev

与新应用上传类似，在相同位置执行 `the_path_of_AppBuilder/czdev publish --deb the_new_version.deb`，工具会自动处理新版本安装包的相关信息并新建 pull request。

### 网站

与新应用上传类似，在网站上传新版安装包，网站会自动解析并填入该应用上一版本的各项信息。如有更新，请更改相应字段。提交后，网站会新建 pull request。

## 应用下架

### czdev

与新应用上传类似，在相同位置执行 `the_path_of_AppBuilder/czdev unpublish package_name --version 1.2.3`，工具会检查应用归属等信息后新建一条用于下架该版本应用的 pull request。

![czdev unpublish](assets/docs/Submit10_czdev_unpublish.png)

### 网站

与新应用上传类似，在网站上点击 `My packages` 按钮，即可看到该 GitHub 账号对应的所有应用及版本。在对应的项目中点击 `unpublish`，网站会新建一条用于下架该版本应用的 pull request。

![web manage](assets/docs/Submit09_web_manage.png)

## 参考内容

- [CardputerZero 应用开发规范](https://cardputer.cc/#/documents/cp0-dev)
- [CardputerZero/Template](https://github.com/CardputerZero/Template)：应用开发模版
- [CardputerZero/AppBuilder](https://github.com/CardputerZero/AppBuilder)：包含 czdev 命令行工具
- [CardputerZero/dev-portal](https://github.com/CardputerZero/dev-portal)：开发者中心网站工具
- [CardputerZero/packages](https://github.com/CardputerZero/packages)：Store 中所有第三方应用的目录
- [CardputerZero/Store](https://github.com/CardputerZero/Store)：设备端 Store 应用
- [CardputerZero/cardputerzero.github.io](https://github.com/CardputerZero/cardputerzero.github.io)：cardputer.cc 网站
