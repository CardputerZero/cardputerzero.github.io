# CardputerZero AppStore Hub 文档

这个目录记录 CardputerZero AppStore Hub 的产品、registry、Web UI、提交流程和治理规则需求。

当前目标：

- AppStore 官网以静态文件方式托管在 GitHub Pages。
- 开发者通过 Pull Request 提交自己的应用元信息。
- GitHub Actions 对元信息、资源、源码、构建、模拟器运行和打包流程进行自动检查。
- 审核通过后生成新的 registry `json/yml` 文件。
- GitHub Pages 官网读取生成后的 registry，展示可搜索、可筛选、可分页、可分享的 CardputerZero 应用列表。
- Web UI 支持简体中文、英文、日语三种界面语言。
- Web UI 支持响应式设计，适配手机、平板和电脑浏览。
- 真机 AppStore 可以通过 registry 下载应用，也可以输入应用分享码直接查找下载。

## 文档列表

- [应用提交指南](./app-submission-guide.md)
- [用户与开发者协议](./user-agreement.md)
- [AppStore Registry 和 Web UI 需求](./appstore-registry-requirements.md)
- [开发者提交规范、行为准则和拒收规则](./developer-submission-policy.md)

网站的 `#/documents` 路由会直接读取并渲染这些 Markdown 文件；保留原始 Markdown 是为了让 GitHub review、维护者维护和静态站展示使用同一份文档来源。

## 设计参考

当前偏好的页面布局方向接近 GitHub Marketplace 和 Docker Hub：

- 搜索优先，列表页能快速查找应用。
- 应用卡片展示图标、标题、作者、简介、分类、权限和审核状态。
- 详情页像 README + registry 元信息页，展示截图、版本、下载、源码、权限、依赖、风险提示。
- 整体要有技术 registry 的透明度，但普通 CardputerZero 用户也能看懂。

视觉风格和主题 token 详见 [Hub 设计定义](../DESIGN.md)。默认方向是 geek / hacker / green on black，并预留了隐形主题层，方便后续切换到其他视觉风格。
