import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CardputerZero',
  description: 'Developer Documentation for M5Stack CardputerZero',
  base: '/docs/',
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Hardware', link: '/hardware/' },
      { text: 'Software', link: '/software/' },
      { text: 'Resources', link: '/resources/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Tech Specs', link: '/guide/tech-specs' },
          ]
        }
      ],
      '/hardware/': [
        {
          text: 'Hardware',
          items: [
            { text: 'Overview', link: '/hardware/' },
            { text: 'Display', link: '/hardware/display' },
            { text: 'Keyboard', link: '/hardware/keyboard' },
            { text: 'Audio', link: '/hardware/audio' },
            { text: 'Power', link: '/hardware/power' },
            { text: 'Connectivity', link: '/hardware/connectivity' },
            { text: 'Camera', link: '/hardware/camera' },
            { text: 'Expansion', link: '/hardware/expansion' },
          ]
        }
      ],
      '/software/': [
        {
          text: 'Software',
          items: [
            { text: 'Overview', link: '/software/' },
            { text: 'OS Image', link: '/software/os-image' },
            { text: 'Build with Docker', link: '/software/docker-sdk' },
            { text: 'App Packaging', link: '/software/packaging' },
            { text: 'APPLauncher', link: '/software/applauncher' },
            { text: 'AppStore', link: '/software/appstore' },
            { text: 'Emulator', link: '/software/emulator' },
          ]
        }
      ],
      '/resources/': [
        {
          text: 'Resources',
          items: [
            { text: 'Repositories', link: '/resources/' },
            { text: 'Contributing', link: '/resources/contributing' },
            { text: 'FAQ', link: '/resources/faq' },
          ]
        }
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
