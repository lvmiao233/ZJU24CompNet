// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '计算机网络课程实验文档',
  tagline: '浙江大学 2024-2025学年 秋冬学期',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'http://zjucomp.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'lvmiao233', // Usually your GitHub org/user name.
  projectName: 'ZJU24CompNet', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
        routeBasePath: '/',
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      algolia: {
        // The application ID provided by Algolia
        appId: 'EGPMMA958K',

        // Public API key: it is safe to commit it
        apiKey: 'c5f86a0c2b668b32ac94f0e6761e124f',

        indexName: 'zjucomp',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|domain\\.com',

        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        // replaceSearchResultPathname: {
        //   from: '/docs/', // or as RegExp: /\/docs\//
        //   to: '/',
        // },

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        insights: true,

        //... other Algolia params
      },
      metadata: [
        {name: 'baidu-site-verification', content: 'codeva-V1s0VJvPRM'},
      ],
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '计算机网络课程实验',
        logo: {
          alt: '计算机网络课程实验',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '实验指导',
          },
          {
            type: 'docSidebar',
            sidebarId: 'noteSidebar',
            position: 'left',
            label: '课程解析',
          },
          {to: '/blog', label: '延伸阅读', position: 'left'},
          {
            href: 'https://github.com/lvmiao233/ZJU24CompNet',
            label: '文档仓库',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '实验文档',
            items: [
              {
                label: '实验指导',
                to: '/docs/intro',
              },
              {
                label: '课程解析',
                to: '/notes/intro',
              },
              {
                label: '延伸阅读',
                to: '/blog',
              },
            ],
          },
          {
            title: '其他课程资源',
            items: [
              {
                label: '计算机网络课程网站',
                href: 'http://10.214.0.253/network/exercise/index.php',
              },
              {
                label: '计算机网络朋辈辅学',
                href: 'https://www.yuque.com/xianyuxuan/coding/network',
              },
              {
                label: '浙江大学课程攻略共享计划',
                href: 'https://github.com/QSCTech/zju-icicles',
              },
            ],
          },
          {
            title: '实验资源',
            items: [
              {
                label: 'WireShark',
                href: 'https://www.wireshark.org/',
              },
              {
                label: 'GNS3',
                href: 'https://github.com/GNS3/gns3-gui',
              },
              {
                label: '编程实验测试框架',
                href: 'https://github.com/lvmiao233/NetLabFramework',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 浙江大学2024年计算机网络课程实验文档。使用 Docusaurus 搭建.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
