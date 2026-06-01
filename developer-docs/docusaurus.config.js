/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CardputerZero',
  tagline: 'Developer Documentation for the Pocket Linux Computer',
  url: 'https://cardputerzero.github.io',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'CardputerZero',
  projectName: 'cardputerzero.github.io',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/CardputerZero/cardputerzero.github.io/tree/main/developer-docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'CardputerZero',
        items: [
          { type: 'docSidebar', sidebarId: 'guideSidebar', position: 'left', label: 'Guide' },
          { type: 'docSidebar', sidebarId: 'hardwareSidebar', position: 'left', label: 'Hardware' },
          { type: 'docSidebar', sidebarId: 'softwareSidebar', position: 'left', label: 'Software' },
          { href: 'https://github.com/CardputerZero', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright ${new Date().getFullYear()} M5Stack / CardputerZero Contributors. MIT License.`,
      },
      colorMode: {
        defaultMode: 'dark',
      },
    }),
};

module.exports = config;
