// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '计算机网络课程实验文档',
  tagline: '浙江大学 2025-2026学年 秋冬学期',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://zjucomp.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'lvmiao233', // GitHub org/user name.
  projectName: 'ZJU24CompNet', // repo name.

  onBrokenLinks: 'warn',
  
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // /docs/oldDoc -> /docs/newDoc
          { to: '/docs/Lab7_page', from: '/docs/Coding/Lab7_page', },
          { to: '/docs/Lab8_page', from: '/docs/Coding/Lab8_page', },
          { to: '/docs/Lab1/Lab1_Detailed', from: '/docs/Lab1_page', },
          { to: '/docs/Lab2/Lab2_Detailed', from: '/docs/Lab2_page', },
          { to: '/docs/Lab3/Lab3_Detailed', from: '/docs/Lab3_page', },
          { to: '/docs/Lab4/Lab4_Detailed', from: '/docs/Lab4_page', },
          { to: '/docs/Lab5/Lab5_Detailed', from: '/docs/Lab5_page', },
          { to: '/docs/Lab6/Lab6_Detailed', from: '/docs/Lab6_page', }
        ],
      },
    ],
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          // Enable this to enable the "edit this page" links.
          // editUrl: 'https://github.com/lvmiao233/ZJU24CompNet/',
        },
        blog: {
          showReadingTime: true,
          // Enable this to enable the "edit this page" links.
          // editUrl: 'https://github.com/lvmiao233/ZJU24CompNet/',
        },
        theme: { customCss: './src/css/custom.css', },
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
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        insights: true,
        askAi: 'WYUJKj5Jh3ts',
      },
      metadata: [ {name: 'name', content: '浙大计网实验文档'}, ],
      image: 'img/zjucompnet-social-card.jpg',
      announcementBar: {
        id: 'quiz3_5',
        content:
            '💯Quiz 4-5即将于2025-12-16晚实验课进行，请务必关注群内通知，按时参加Quiz',
        backgroundColor: '#fafbfc',
        textColor: '#091E42',
        isCloseable: true,
      },
      navbar: {
        title: '计算机网络课程实验',
        logo: { alt: '计算机网络课程实验', src: 'img/logo.svg', },
        items: [
          {
            type: 'docSidebar', sidebarId: 'tutorialSidebar',
            label: '实验指导', position: 'left',
          }, {
            type: 'docSidebar', sidebarId: 'noteSidebar',
            label: '课程解析', position: 'left',
          }, {to: '/blog', label: '延伸阅读', position: 'left'}, {
            href: 'https://github.com/lvmiao233/NetLabFramework',
            label: '测试框架', position: 'right',
          }, {
            href: 'https://github.com/lvmiao233/ZJU24CompNet',
            label: '文档仓库', position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '实验文档',
            items: [
              { label: '实验指导', to: '/docs/intro/', },
              { label: '课程解析', to: '/notes/intro/', },
              { label: '延伸阅读', to: '/blog/', },
            ],
          }, {
            title: '其他课程资源',
            items: [
              { label: '计算机网络课程网站', href: 'http://10.214.0.253/network/exercise/index.php', },
              { label: '计算机网络朋辈辅学', href: 'https://www.yuque.com/xianyuxuan/coding/network', },
              { label: '浙江大学课程攻略共享计划', href: 'https://github.com/QSCTech/zju-icicles', },
            ],
          }, {
            title: '实验资源',
            items: [
              { label: 'WireShark', href: 'https://www.wireshark.org/', },
              { label: 'GNS3', href: 'https://github.com/GNS3/gns3-gui', },
              { label: '编程实验测试框架', href: 'https://github.com/lvmiao233/NetLabFramework', },
            ],
          }, {
            title: '镜像加速页面',
            items: [
              { label: 'Github Pages源', href: 'https://zjucomp.net', },
              { label: 'Cloudflare Page源', href: 'https://cfpage.zjucomp.net', },
              { label: 'Azure Static Web Page源', href: 'https://azure.zjucomp.net', },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 浙江大学2025年计算机网络课程实验文档。使用 Docusaurus 搭建.`,
      },
      prism: {
        additionalLanguages: ['HTTP'],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      docs: { sidebar: { hideable: true, }, },
    }),

  future: {
    experimental_faster: true,
    v4: true,
  },
};

export default config;
