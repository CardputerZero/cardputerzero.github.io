# AppStore Registry 和 Web UI 需求

## 目标

建设一个公开的 CardputerZero AppStore 网站。网站以静态文件方式托管在 GitHub Pages，通过读取生成后的 registry JSON 文件，展示一个可以分类筛选、搜索、分页、查看详情和分享的 CardputerZero 应用目录。

整体工作流：

1. 开发者构建符合 APPLaunch 约定的 ARM64 `.deb`。
2. 开发者运行严格 prepublish check，并通过 `czdev publish` 发布。
3. `czdev` 向 `CardputerZero/packages` 创建包含 `.deb`、`meta.json`、图标和截图的 Pull Request。
4. GitHub Actions 校验 package metadata、素材、checksum 和 APT index 输出。
5. 维护者审核风险、隐私、设备安全和用户体验。
6. 合并后 packages 仓库重建 APT index。
7. 官网从 package metadata 同步生成 `generated/registry.json`，并通过 GitHub Pages 发布。
8. 真机 AppStore 读取 registry，支持浏览、搜索、输入分享码，并只安装 approved 的 `.deb` 应用。

## 产品方向

Web UI 的信息架构参考 GitHub Marketplace 和 Docker Hub：

- 首页和列表页以搜索为中心。
- 应用卡片展示标题、图标、作者、简介、分类、审核状态、源码开放程度和关键权限。
- 支持按分类、权限、源码开放程度、外部硬件、是否服务、是否支持 HDMI、是否可商用等条件筛选。
- 详情页展示 README 风格介绍、截图、元信息、下载链接、源码链接、版本、依赖、权限、隐私声明和风险提示。
- 作者身份以 GitHub ID 为主。
- 面向普通用户时要清晰易读，面向开发者时要保留 registry 的技术透明度。

## 仓库模型

现有仓库职责：

- 独立应用仓库，例如 `CardputerZero/2048`、`CardputerZero/Calculator`，继续保存应用源码和 release。
- `M5CardputerZero-APPLaunch` 继续作为启动器主仓库，可用 submodule 引用一部分内置应用。
- `CardputerZero/packages` 保存已发布 `.deb`、package `meta.json`、图标和截图，并生成 APT index。
- `CardputerZero/cardputerzero.github.io` 保存官网、文档和从 packages 同步生成的 registry JSON。
- AppStore registry 不应依赖 APPLaunch 主仓库作为唯一数据源；packages metadata 是公开应用目录的上游数据源。

建议目录结构：

```text
cardputerzero.github.io/
  generated/
    registry.json
    registry-index.json  # legacy compatibility alias
  site/
    ...
  docs/
    ...
```

## 静态托管要求

官网必须可以完全静态化：

- 不依赖后端服务。
- GitHub Pages 是默认发布目标。
- registry 文件由 GitHub Actions 生成。
- Web UI 在浏览器端读取 registry 并完成搜索、筛选、分页和详情展示。

建议页面：

- `/`：首页和推荐应用。
- `/apps`：应用列表。
- `/apps/<uuid>`：应用详情页。
- `/s/<share-code>`：分享码短链接。
- `/submit`：开发者提交流程。
- `/policy`：准入规则和行为准则。

注意：GitHub Pages 没有动态路由能力。可以选择 hash route，例如 `/#/apps/<uuid>`，也可以在构建阶段为每个应用生成静态详情页。

## Web UI 国际化要求

第一版 Web UI 必须支持三种界面语言：

- 简体中文：`zh-CN`
- 英文：`en`
- 日语：`ja`

要求：

- 所有导航、按钮、筛选项、状态 badge、错误提示、空状态、表单说明、风险提示和提交流程文案都必须走 i18n 字典，不允许在组件中硬编码界面文案。
- 默认语言优先跟随浏览器语言；如果浏览器语言不在支持列表中，默认使用 `zh-CN`。
- 用户手动选择语言后，应保存在 `localStorage` 或 URL 参数中，刷新页面后保持选择。
- 顶部导航或设置菜单中必须提供语言切换入口。
- 建议应用和管理后台支持 i18n：简体中文、日语、英文。默认跟随系统语言自动切换；如果项目包含日历管理后台，应允许用户在后台切换语言，并用该选择覆盖系统语言。
- HTML `lang` 属性应跟随当前语言变化。
- 所有 registry 枚举值在 UI 层显示时必须映射为本地化标签，例如审核状态、分类、权限、源码开放程度和商业使用状态。
- 搜索至少应覆盖 registry 原始字段、本地化标题、简介和描述，并同时纳入当前语言和 fallback 语言。
- 文档页、提交页和 Policy 页应支持三语内容；第一版可以先以 `zh-CN` 为源语言，逐步补齐 `en` 和 `ja` 翻译。
- 日语和英文文本长度不同，按钮、badge、筛选项和卡片布局不得依赖固定中文宽度。

建议资源结构：

```text
hub/
  site/
    src/
      i18n/
        zh-CN.json
        en.json
        ja.json
```

建议语言 fallback：

```text
selected language -> browser language -> zh-CN
```

## Web UI 响应式要求

第一版 Web UI 必须支持手机、平板和电脑浏览，不允许只按桌面宽度设计。

目标设备：

- 手机：`320px` 到 `767px` 宽度。
- 平板：`768px` 到 `1023px` 宽度。
- 桌面：`1024px` 及以上宽度。

要求：

- 所有核心页面都必须响应式，包括首页、应用列表、应用详情、分享码页面、提交页和 Policy 页。
- 手机端必须能完成搜索、筛选、查看详情、复制分享码、查看权限风险和进入下载入口。
- 平板端应优先使用双栏或紧凑网格，避免把桌面布局简单缩小。
- 桌面端列表页可以使用左侧筛选栏 + 右侧结果区；手机端筛选应折叠为抽屉、弹层或顶部筛选入口。
- 应用卡片在手机端单列展示，平板端 2 列，桌面端 2 到 3 列。
- 详情页在桌面端可以使用主内容 + 元信息侧栏；手机端元信息侧栏应下移或拆成连续区块。
- 导航在手机端应压缩为品牌、搜索入口、菜单入口和语言切换，不得遮挡主要内容。
- 表格、checksum、URL、UUID 等长字段必须换行或横向滚动，不得撑破页面。
- 320px 宽度下不得出现文字重叠、按钮溢出、横向整页滚动或无法点击的控件。
- 触控目标高度不小于 `32px`，主要操作建议不小于 `40px`。

建议在 CI 或手工验收中至少检查这些视口：

```text
320x568
390x844
768x1024
1024x768
1440x900
```

## PR 和 GitHub Actions 流程

Pull Request 阶段应执行：

1. 校验新增或修改的应用元信息文件。
2. 校验 UUID 格式和唯一性。
3. 校验分享码唯一性。
4. 校验必填字段。
5. 校验图标和截图的文件类型、大小和尺寸。
6. 校验下载地址、源码地址、release 地址是否可访问。
7. 校验权限声明、隐私声明和准入要求字段是否完整。
8. 如果提供源码，执行源码可访问性检查。
9. 如果项目支持 CI 构建，执行构建和打包检查。
10. 如果有模拟器或 SDL 路径，执行 smoke test。
11. 生成预览 registry，供维护者 review。

合并到主分支后应执行：

1. 读取所有应用元信息。
2. 规范化字段和默认值。
3. 生成 `generated/registry.json`。
4. 生成 `generated/registry-index.json` 兼容别名，供旧版 AppStore 客户端继续读取。
5. 构建 GitHub Pages 静态网站。
6. 发布网站和 registry。

## 安全和质量检查

如果开发者提供源码，可加入这些自动流程：

- secret scanning。
- 依赖和许可证检查。
- 基础静态代码扫描。
- Linux AArch64 构建检查。
- APPLaunch `.desktop` 文件校验。
- 图标和截图校验。
- 模拟器或 SDL smoke test。
- 打包产物结构校验。
- 生成下载文件 checksum。

自动流程不是完整安全审计，只是第一道门槛。对于高风险应用，仍然需要人工审核。

高风险情况包括：

- 闭源或 binary-only。
- 网络访问。
- 摄像头、麦克风、GPS、传感器、文件系统访问。
- 后台服务。
- 外部硬件控制。
- 账号、支付、云服务。
- 修改系统配置或安装额外服务。

## 应用元信息

每个应用必须有稳定 UUID。分享码使用 UUID 的前四位。

规则：

- 分享码必须唯一。
- 如果两个应用 UUID 前四位相同，registry 生成流程必须失败。
- 如果未来应用数量增长导致碰撞风险变高，可以把分享码长度扩展到 5 位或更多，但已经发布的旧分享码要尽量保持兼容。

必填或推荐字段：

- `uuid`：稳定应用 UUID。
- `title`：应用标题。
- `summary`：一句话介绍。
- `description`：详细介绍。
- `locales` / `i18n`：按语言覆盖标题、简介和描述，推荐至少包含 `zh-CN`、`en`、`ja`。
- `categories`：分类，可多选。
- `device_targets`：设备，当前暂时只有 `CardputerZero`，Web UI 可先隐藏。
- `author.github`：作者 GitHub ID。
- `icon`：应用图标。
- `screenshots`：截图，强烈推荐。
- `download.url`：Debian `.deb` 下载地址或 release artifact 地址。
- `download.package`：Debian 包名，用于检测已安装状态和卸载。
- `download.md5`：下载文件 MD5 校验值。
- `version`：当前版本。
- `license`：许可证。
- `source.openness`：源码开放程度。
- `source.repository`：源码地址。
- `permissions`：数据和设备权限。
- `dependencies`：运行依赖。
- `external_hardware`：是否需要外部设备。
- `service`：是否后台服务。
- `hdmi_output`：是否支持 HDMI 输出。
- `commercial_use`：是否允许商用。
- `privacy`：数据访问、保存、上传和第三方共享声明。
- `risk_flags`：已知风险。
- `review`：审核状态。

建议 package `meta.json` 示例：

```json
{
  "title": "Example App",
  "summary": "Short one-line description.",
  "description": "Longer user-facing description.",
  "locales": {
    "zh-CN": {
      "title": "示例应用",
      "summary": "一句话中文简介。",
      "description": "面向用户的中文详细介绍。"
    },
    "en": {
      "title": "Example App",
      "summary": "Short one-line description.",
      "description": "Longer user-facing description."
    },
    "ja": {
      "title": "サンプルアプリ",
      "summary": "短い日本語の概要。",
      "description": "ユーザー向けの日本語説明。"
    }
  },
  "categories": ["Utilities"],
  "author": {
    "github": "developer-github-id",
    "display_name": "Developer Name"
  },
  "license": "MIT",
  "source_repo": "https://github.com/example/app",
  "icon": "example-app.png",
  "screenshots": [
    "screenshots/main.png",
    "screenshots/detail.png",
    "screenshots/settings.png",
    "screenshots/confirm.png"
  ],
  "published_at": "2026-05-14T23:20:55+08:00",
  "updated_at": "2026-05-14T23:20:55+08:00",
  "permissions": {
    "camera": false,
    "microphone": false,
    "network": false,
    "filesystem": "app-data-only"
  },
  "privacy": {
    "collects_personal_data": false,
    "data_retention": "none",
    "third_party_sharing": false
  },
  "review": {
    "status": "pending"
  }
}
```

## 分类建议

初始分类可包括：

- Games
- Media
- Music
- Productivity
- Developer Tools
- Network
- Communication
- Hardware
- Education
- Utilities
- System
- AI
- Experimental

一个应用可以属于多个分类。

## 权限和能力维度

权限必须明确声明，并且可作为 Web UI 筛选条件。

初始权限/能力维度：

- 摄像头。
- 麦克风。
- 扬声器或音频输出。
- 传感器。
- GPS 或位置。
- 网络访问。
- 本地文件系统。
- 用户创建文件。
- 用户身份或账号信息。
- 设备唯一标识。
- 键盘输入。
- 外部硬件模块。
- HDMI 输出。
- 后台服务。

每个敏感权限都应说明用途。详情页和真机 AppStore 都应该突出展示敏感权限。

## 源码开放程度

建议区分：

- `open-source`：完整源码公开，许可证清晰。
- `source-available`：源码可查看，但使用受限。
- `closed-source`：源码不公开。
- `binary-only`：只提交二进制。
- `mixed`：部分开源、部分闭源。

Web UI 应支持按源码开放程度筛选。闭源和 binary-only 应有更严格的审核和更醒目的提示。

## Web UI 功能需求

列表页：

- 按标题、简介、描述、作者、分类、分享码搜索。
- 分类筛选。
- 权限筛选。
- 源码开放程度筛选。
- 外部硬件需求筛选。
- 是否后台服务筛选。
- 是否支持 HDMI 筛选。
- 是否允许商用筛选。
- 分页。
- 排序：最近更新、最新发布、名称、审核状态。
- 卡片展示：图标、标题、作者、简介、分类、权限 badge、审核 badge。

详情页：

- 应用标题、图标、作者、简介。
- 下载或安装入口。
- 分享码和分享链接。
- 截图。
- 详细介绍。
- 分类和设备。
- 依赖。
- 是否后台服务。
- 源码开放程度和源码地址。
- 权限和隐私声明。
- HDMI 支持。
- 外部硬件需求。
- 是否可商用。
- License。
- 下载地址和 checksum。
- 版本和更新时间。
- 审核状态和风险提示。

分享：

- 每个应用的分享码来自 UUID 前四位。
- 示例：UUID `123e4567-e89b-12d3-a456-426614174000` 的分享码为 `123e`。
- 网站支持 UUID 链接和分享码短链接。
- 真机 AppStore 支持输入分享码查找并下载应用。
- registry 生成器必须保证分享码唯一。

## 真机 AppStore 需求

CardputerZero 真机 AppStore 应支持：

- 下载 registry。
- 搜索应用。
- 输入分享码。
- 展示标题、图标、简介、分类、权限、审核状态和风险提示。
- 从 `download.url` 下载 `.deb` 应用包到本地缓存。
- 安装前必须校验 `download.md5` checksum。
- 通过系统包管理器安装本地 `.deb`，包内应提供 APPLaunch 兼容的 desktop entry 和资源。
- 对不支持设备、缺依赖、被下架或风险过高的应用展示明确错误。

第一版真机 AppStore 可以很轻，但“输入分享码下载应用”应作为核心流程。

## 审核状态

建议状态：

- `pending`：已提交，未审核。
- `ci-passed`：自动检查通过。
- `approved`：已接受。
- `needs-changes`：需要开发者修改。
- `rejected`：拒收。
- `deprecated`：不推荐继续使用。
- `blocked`：因政策、安全或法律原因隐藏或移除。

`rejected` 不应作为可安装应用展示。`blocked` 通常应从安装结果中隐藏，但可以在审计记录中保留。

## 待定问题

- 最终提交仓库名称。
- v1 metadata schema 的字段和枚举值。
- 生成的 registry 文件是提交到主分支、发布到 `gh-pages`，还是作为 GitHub Pages artifact。
- v1 是否允许 binary-only 应用。
- 应用包格式：裸二进制、tarball、Debian package，还是自定义 APPLaunch package。

## 后续阶段

- v1 暂不做下载量、热度或浏览量统计。
- 评论系统进入规划时，再一起评估下载量、评分、评论、收藏、举报和反滥用策略。
- 如果后续加入统计能力，应明确隐私边界、数据保存周期和是否需要后端服务。
