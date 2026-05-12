// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Iron Ledger',
  tagline: 'Mecha Guild Management Sim — Design Documentation',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://Facundo-Villafane.github.io',
  baseUrl: '/iron-ledger/',

  organizationName: 'Facundo-Villafane',
  projectName: 'iron-ledger',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../design',
          exclude: ['CLAUDE.md', 'registry/**', '**/*.yaml'],
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/Facundo-Villafane/iron-ledger/edit/master/design/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Iron Ledger',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'designSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/Facundo-Villafane/iron-ledger',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Iron Ledger © ${new Date().getFullYear()} — Documentación de diseño`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
