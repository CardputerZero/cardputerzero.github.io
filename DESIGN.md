# CardputerZero AppStore Hub 设计定义

## 设计目标

CardputerZero AppStore Hub 是一个公开、静态、可审计的应用 registry 网站。界面应优先服务搜索、筛选、风险判断、安装决策和开发者提交，而不是做成营销首页。

默认视觉方向为 `zero-hacker`：geek / hacker / green on black。它借鉴终端、代码编辑器和 registry 工具的秩序感，但必须保持可信、清晰、克制，避免廉价的赛博装饰。

参考锚点：

- GitHub Marketplace：搜索优先、卡片清晰、生态目录感。
- Docker Hub：registry 透明度、元信息密度、版本与来源可追踪。
- Warp / VoltAgent 风格：深色终端底、绿色信号色、开发者工具气质。

## 信息架构

首屏必须直接进入可用的 AppStore 体验：

- 顶部：品牌、全局搜索、主要导航、提交入口。
- 首页：搜索框、推荐/最近更新应用、核心筛选入口、registry 状态。
- 应用列表：筛选栏、排序、分页、应用卡片。
- 应用详情：应用 README、截图、安装/下载、分享码、权限、隐私、风险、源码、checksum。
- 提交页：开发者 PR 流程、metadata 模板、准入检查清单。
- Policy 页：拒收规则、隐私和设备安全要求。

不要做独立的营销 hero。品牌可以有存在感，但第一屏应让用户立即搜索、筛选或进入应用。

## 默认主题：zero-hacker

视觉性格：

- 黑色为工作台，绿色为信号，不用大面积彩色渐变。
- UI 像 registry / terminal / debugger，而不是游戏机皮肤。
- 密度中高，适合快速扫描大量应用。
- 风险、安全、权限信息必须比装饰更醒目。
- 发光效果只能用于焦点、在线状态和关键 CTA，不能作为背景装饰。

禁止：

- Matrix rain、随机代码雨、骷髅、警报式红绿闪烁。
- 大面积霓虹外发光。
- 暗背景上低对比灰字。
- 把每个区域都做成浮动卡片。
- 为了“黑客感”牺牲普通用户可读性。

## 隐形主题层

主题必须作为不可见的语义层存在。组件不得直接依赖 `green`、`black`、`hacker` 这类具体风格命名，而应依赖语义 token。默认主题可以是绿色黑底，但切换到其他风格时只替换 token，不改组件结构。

推荐实现：

```html
<html data-theme="zero-hacker">
```

```css
:root {
  color-scheme: dark;
}

[data-theme="zero-hacker"] {
  --color-canvas: #020403;
  --color-surface: #07100c;
  --color-surface-raised: #0b1711;
  --color-surface-hover: #102219;
  --color-border: #163424;
  --color-border-strong: #2d6b48;
  --color-text: #d8f3df;
  --color-text-muted: #88a894;
  --color-text-faint: #5f7a68;
  --color-accent: #32e875;
  --color-accent-soft: #123b24;
  --color-accent-strong: #8cffb4;
  --color-warning: #f0c45c;
  --color-danger: #ff5f66;
  --color-info: #64d2ff;
  --color-approved: #32e875;
  --color-pending: #f0c45c;
  --color-rejected: #ff5f66;
  --shadow-focus: 0 0 0 2px rgba(50, 232, 117, 0.42);
  --radius-control: 4px;
  --radius-card: 6px;
  --font-ui: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}
```

组件只允许使用这些语义变量：

- `--color-canvas`：页面背景。
- `--color-surface`：普通面板、筛选栏、列表区域。
- `--color-surface-raised`：卡片、弹层、详情侧栏。
- `--color-border` / `--color-border-strong`：分隔和强调。
- `--color-text` / `--color-text-muted` / `--color-text-faint`：文字层级。
- `--color-accent`：主要操作、焦点、分享码、可安装状态。
- `--color-warning` / `--color-danger` / `--color-info`：风险和状态。

主题注册建议：

```ts
type HubThemeId = "zero-hacker" | "clean-registry" | "device-lab";

type HubTheme = {
  id: HubThemeId;
  label: string;
  colorScheme: "dark" | "light";
  tokens: Record<string, string>;
};
```

第一版可以不暴露主题切换 UI，但代码和 CSS 必须保留 `data-theme` 入口。后续新增主题时只添加 token 映射，例如：

- `clean-registry`：白底/浅灰/蓝色强调，用于更接近 GitHub Marketplace 的普通用户版本。
- `device-lab`：深蓝灰/琥珀强调，用于硬件实验室气质。

## 布局原则

- 页面最大内容宽度：`1180px` 到 `1280px`。
- 列表页采用左侧筛选 + 右侧结果。窄屏时筛选折叠为抽屉或顶部按钮。
- 卡片网格在桌面使用 2 到 3 列，移动端 1 列。
- 详情页使用主内容 + 元信息侧栏。移动端侧栏下移。
- 页面区块应是全宽背景带或无框布局；卡片只用于应用、截图、风险条目、表单分组。
- 卡片圆角不超过 `6px`，按钮圆角不超过 `4px`。

## 组件规范

### 顶部导航

- 左侧显示 `CardputerZero AppStore` 或 `AppStore Hub`。
- 中间或右侧保留搜索入口。
- 导航项：Apps、Submit、Policy、Registry。
- 当前页使用绿色下划线或左侧短线，不使用大面积填充。

### 搜索

- 搜索框是主控件，支持标题、简介、描述、作者、分类、分享码。
- 输入框背景使用 `--color-surface-raised`，边框使用 `--color-border`。
- 聚焦状态使用 `--shadow-focus`，不要用跳动动画。
- 分享码匹配时应显示等宽字体和高可信提示。

### 筛选

- 筛选项使用复选框、开关、分段控件或下拉菜单。
- 高风险权限筛选要始终可见：Network、Filesystem、Camera、Microphone、Sensors、External Hardware、Background Service。
- 已选筛选条件用紧凑 chip 展示，可一键清除。

### 应用卡片

每张卡片必须展示：

- 图标、标题、作者。
- 一句话简介。
- 分类。
- 审核状态 badge。
- 源码开放程度 badge。
- 敏感权限 badge。
- 分享码。

卡片应支持快速扫描：

- 标题和分享码使用较高对比。
- 简介最多 2 行。
- 权限 badge 不超过一行，溢出用 `+N`。
- `approved`、`pending`、`blocked` 等状态颜色必须稳定。

### 详情页

详情页必须把信任信息放在显眼位置：

- 下载入口旁展示 checksum 和版本。
- 分享码使用等宽字体。
- 权限、隐私和风险提示不得折叠到难以发现的位置。
- 闭源、binary-only、后台服务、网络访问、外部硬件控制必须有醒目的 warning。

### Badge

Badge 使用小字号、等高、低圆角：

- `approved`：绿色。
- `ci-passed`：蓝色。
- `pending` / `needs-changes`：黄色。
- `rejected` / `blocked`：红色。
- `deprecated`：灰色。
- `open-source`：绿色或青色。
- `binary-only` / `closed-source`：黄色或红色。

### 表格和元信息

- registry 字段、UUID、checksum、分享码使用等宽字体。
- 元信息表格应支持复制字段值。
- 长 URL 和 checksum 必须换行或横向滚动，不能撑破布局。

## 字体

- UI 字体：Inter / system-ui。
- 技术字段：JetBrains Mono / SFMono-Regular / Consolas。
- 不使用过窄、过装饰的显示字体。
- 页面标题应克制，详情页标题不应超过 32px。
- 列表、卡片、筛选区域以 13px 到 16px 为主。

## 动效

动效应像开发者工具一样快、短、可预期：

- hover：背景或边框轻微变化。
- focus：绿色 focus ring。
- loading：短横线扫描或 skeleton，不使用大型 spinner。
- 页面切换：可无动画。
- 状态变化：150ms 到 220ms。

不要使用持续循环的背景动画。

## 文案语气

文案要直接、可信、面向用户决策：

- 用 “Network access declared” 而不是 “This app is super connected”。
- 用 “Binary-only: extra review required” 而不是 “Unknown magic binary”。
- 用 “Share code” 而不是 “Secret code”。
- 风险提示要说明原因和影响，不要制造恐慌。

Web UI 必须支持简体中文、英文、日语三种界面语言。顶部导航或设置菜单应提供语言切换入口，语言选择控件保持紧凑，不抢占搜索和提交入口。

语言设计要求：

- Locale key 使用 `zh-CN`、`en`、`ja`。
- 界面文案不得硬编码在组件中，所有可见字符串都应来自 i18n 字典。
- 关键 registry 字段名可以保持 schema 原名，但用户可见标签必须本地化。
- Badge、按钮、筛选项、卡片标题区必须能容纳英文和日语长度差异，不能按中文短词固定宽度。
- 如果空间有限，优先保留状态和风险含义，不用装饰性副标题。
- 等宽技术字段如 UUID、checksum、share code 不翻译，只翻译字段标签。

## 响应式要求

Hub 必须是响应式静态站，服务手机、平板和电脑浏览。布局不能只把桌面页面等比缩小。

断点建议：

- `compact`：`320px` 到 `767px`，手机。
- `medium`：`768px` 到 `1023px`，平板。
- `wide`：`1024px` 及以上，桌面和笔记本。

响应式行为：

- 320px 宽度下不能出现文字重叠、按钮溢出或整页横向滚动。
- 手机端导航收敛为品牌、搜索入口、菜单入口和语言切换。
- 手机端筛选应折叠，但当前筛选状态必须用 chip 或摘要条保持可见。
- 手机端应用卡片单列展示，关键 badge 可以换行，但不能遮挡标题和操作。
- 平板端列表优先使用 2 列卡片，筛选可以改为顶部区域或窄侧栏。
- 桌面端列表使用左侧筛选 + 右侧 2 到 3 列卡片。
- 详情页桌面端使用主内容 + 侧栏；手机端侧栏下移，安装入口、分享码和风险提示仍然靠前。
- 截图区域保持固定比例，避免加载后布局跳动。
- registry 表格、URL、checksum 和 UUID 必须支持换行、复制或局部横向滚动。

验收视口：

- `320x568`
- `390x844`
- `768x1024`
- `1024x768`
- `1440x900`

## 可访问性

- 所有交互控件必须有可见 focus 状态。
- 正文和背景对比度至少满足 WCAG AA。
- 状态不能只靠颜色表达，必须有文字标签。
- badge、按钮、表单控件的点击区域不小于 32px 高。
- 图标必须有文本标签或 `aria-label`。
