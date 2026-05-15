# CardputerZero AppStore Hub 文档

这个目录记录 CardputerZero AppStore Hub 的产品、registry、Web UI、提交流程和治理规则需求。

当前目标：

- AppStore 官网以静态文件方式托管在 GitHub Pages。
- 开发者优先通过 `czdev publish` 提交 `.deb`、`meta.json`、图标和截图到 `CardputerZero/packages`。
- GitHub Actions 对 package metadata、资源、APT Packages index 和 registry 生成流程进行自动检查。
- 审核通过后从 packages 仓库同步生成新的 registry `json` 文件。
- GitHub Pages 官网读取生成后的 registry，展示可搜索、可筛选、可分页、可分享的 CardputerZero 应用列表。
- Web UI 支持简体中文、英文、日语三种界面语言。
- Web UI 支持响应式设计，适配手机、平板和电脑浏览。
- 真机 AppStore 可以通过 registry 下载 `approved` 的 `.deb` 应用，也可以输入应用分享码直接查找下载。

## 文档列表

- [CardputerZero 应用开发入门](./zh-CN/application-development-guide.md)
- [Skill 与 AI Coding 开发指南](./zh-CN/skill-ai-coding-guide.md)
- [应用提交指南](./zh-CN/app-submission-guide.md)
- [用户与开发者协议](./zh-CN/user-agreement.md)
- [AppStore Registry 和 Web UI 需求](./appstore-registry-requirements.md)
- [开发者提交规范、行为准则和拒收规则](./developer-submission-policy.md)

网站的 `#/documents` 路由会根据当前语言读取对应 Markdown 文件，并从文档标题生成目录。当前支持 `zh-CN`、`en`、`ja` 三套内容；没有独立翻译时应 fallback 到 `zh-CN`。保留原始 Markdown 是为了让 GitHub review、维护者维护和静态站展示使用同一份文档来源。

## 语言目录

- `zh-CN/`：简体中文文档，作为主要源语言。
- `en/`：英文文档。
- `ja/`：日语文档。
- 根目录保留早期文档和中文需求文档，便于维护者 review。

## 设计参考

当前偏好的页面布局方向接近 GitHub Marketplace 和 Docker Hub：

- 搜索优先，列表页能快速查找应用。
- 应用卡片展示图标、标题、作者、简介、分类、权限和审核状态。
- 详情页像 README + registry 元信息页，展示截图、版本、下载、源码、权限、依赖、风险提示。
- 整体要有技术 registry 的透明度，但普通 CardputerZero 用户也能看懂。

视觉风格和主题 token 详见 [Hub 设计定义](../DESIGN.md)。默认方向是 geek / hacker / green on black，并预留了隐形主题层，方便后续切换到其他视觉风格。
