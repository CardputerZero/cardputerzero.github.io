import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CardputerZero',
  description: 'Documentation for M5Stack CardputerZero',
  ignoreDeadLinks: true,
  base: '/docs/',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '用户', link: '/zh-CN/user/' },
          { text: '开发者', link: '/zh-CN/dev/' },
        ],
        sidebar: {
          '/zh-CN/user/': [
            {
              text: '用户指南',
              items: [
                { text: '开箱指南', link: '/zh-CN/user/' },
                { text: 'AppStore', link: '/zh-CN/user/appstore' },
                { text: '内置应用', link: '/zh-CN/user/builtin-apps' },
                { text: '键盘快捷键', link: '/zh-CN/user/keyboard' },
                { text: '系统设置', link: '/zh-CN/user/settings' },
                { text: '外设连接', link: '/zh-CN/user/peripherals' },
                { text: '充电与电池', link: '/zh-CN/user/battery' },
                { text: '固件更新', link: '/zh-CN/user/update' },
                { text: '故障排除', link: '/zh-CN/user/faq' },
              ]
            }
          ],
          '/zh-CN/dev/': [
            {
              text: '概览',
              items: [
                { text: '架构', link: '/zh-CN/dev/' },
                { text: '技术规格', link: '/zh-CN/dev/tech-specs' },
                { text: '仓库索引', link: '/zh-CN/dev/repositories' },
              ]
            },
            {
              text: '快速开始',
              items: [
                { text: 'Docker SDK 环境搭建', link: '/zh-CN/dev/docker-sdk' },
                { text: 'Hello World', link: '/zh-CN/dev/hello-world' },
                { text: '打包与部署', link: '/zh-CN/dev/packaging' },
              ]
            },
            {
              text: '应用开发',
              items: [
                { text: 'SDL2 游戏开发', link: '/zh-CN/dev/sdl2' },
                { text: 'LVGL UI 开发', link: '/zh-CN/dev/lvgl' },
                { text: 'Python 应用', link: '/zh-CN/dev/python' },
                { text: 'Rust 应用', link: '/zh-CN/dev/rust' },
                { text: 'Framebuffer 直写', link: '/zh-CN/dev/framebuffer' },
              ]
            },
            {
              text: '发布应用',
              items: [
                { text: 'AppStore 上架', link: '/zh-CN/dev/publish' },
                { text: '.desktop 规范', link: '/zh-CN/dev/desktop-spec' },
              ]
            },
            {
              text: '硬件访问',
              items: [
                { text: '显示屏', link: '/zh-CN/dev/hw-display' },
                { text: '键盘', link: '/zh-CN/dev/hw-keyboard' },
                { text: '音频', link: '/zh-CN/dev/hw-audio' },
                { text: '摄像头', link: '/zh-CN/dev/hw-camera' },
                { text: 'GPIO / Grove / HAT', link: '/zh-CN/dev/hw-gpio' },
                { text: '电池/电源', link: '/zh-CN/dev/hw-power' },
              ]
            },
            {
              text: '系统开发',
              items: [
                { text: 'OS 镜像构建', link: '/zh-CN/dev/os-image' },
                { text: 'APPLauncher 架构', link: '/zh-CN/dev/applauncher' },
                { text: '贡献指南', link: '/zh-CN/dev/contributing' },
              ]
            },
          ],
        },
      }
    },
    // zh-TW and ja will be added back when translations are ready
    // 'zh-TW': { label: '繁體中文', lang: 'zh-TW' },
    // ja: { label: '日本語', lang: 'ja' },
  },
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'User', link: '/user/' },
      { text: 'Developer', link: '/dev/' },
      { text: 'Open Tasks', link: '/dev/open-tasks' },
    ],
    sidebar: {
      '/user/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Getting Started', link: '/user/' },
            { text: 'AppStore', link: '/user/appstore' },
            { text: 'Built-in Apps', link: '/user/builtin-apps' },
            { text: 'Keyboard Shortcuts', link: '/user/keyboard' },
            { text: 'Settings', link: '/user/settings' },
            { text: 'Peripherals', link: '/user/peripherals' },
            { text: 'Battery & Charging', link: '/user/battery' },
            { text: 'Firmware Update', link: '/user/update' },
            { text: 'FAQ', link: '/user/faq' },
          ]
        }
      ],
      '/dev/': [
        {
          text: 'Overview',
          items: [
            { text: 'Architecture', link: '/dev/' },
            { text: 'Tech Specs', link: '/dev/tech-specs' },
            { text: 'Repositories', link: '/dev/repositories' },
          ]
        },
        {
          text: 'Quick Start',
          items: [
            { text: 'Docker SDK Setup', link: '/dev/docker-sdk' },
            { text: 'Hello World', link: '/dev/hello-world' },
            { text: 'Packaging & Deploy', link: '/dev/packaging' },
          ]
        },
        {
          text: 'App Development',
          items: [
            { text: 'SDL2 Games', link: '/dev/sdl2' },
            { text: 'LVGL UI', link: '/dev/lvgl' },
            { text: 'Python Apps', link: '/dev/python' },
            { text: 'Rust Apps', link: '/dev/rust' },
            { text: 'Framebuffer', link: '/dev/framebuffer' },
          ]
        },
        {
          text: 'Publishing',
          items: [
            { text: 'AppStore Submission', link: '/dev/publish' },
            { text: '.desktop Spec', link: '/dev/desktop-spec' },
          ]
        },
        {
          text: 'Hardware Access',
          items: [
            { text: 'Display', link: '/dev/hw-display' },
            { text: 'Keyboard', link: '/dev/hw-keyboard' },
            { text: 'Audio', link: '/dev/hw-audio' },
            { text: 'Camera', link: '/dev/hw-camera' },
            { text: 'GPIO / Grove / HAT', link: '/dev/hw-gpio' },
            { text: 'Battery & Power', link: '/dev/hw-power' },
          ]
        },
        {
          text: 'System',
          items: [
            { text: 'OS Image Build', link: '/dev/os-image' },
            { text: 'APPLauncher', link: '/dev/applauncher' },
            { text: 'Contributing', link: '/dev/contributing' },
          ]
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CardputerZero' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2025-2026 M5Stack / CardputerZero Contributors'
    },
    search: {
      provider: 'local'
    }
  }
})
