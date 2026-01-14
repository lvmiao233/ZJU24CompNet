import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useSidebarBreadcrumbs } from '@docusaurus/plugin-content-docs/client';
import { useHomePageRoute } from '@docusaurus/theme-common/internal';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import HomeBreadcrumbItem from '@theme/DocBreadcrumbs/Items/Home';
import DocBreadcrumbsStructuredData from '@theme/DocBreadcrumbs/StructuredData';
import { Dropdown, message } from 'antd';
import { CopyOutlined, FileTextOutlined, DownOutlined, ExportOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

// AI 服务配置
// 图标存放在 /assets/ai-icons/ 目录，使用 require 引入
const AI_SERVICES = [
  {
    key: 'chatgpt',
    name: '询问ChatGPT',
    favicon: require('@site/assets/icons/chatgpt.png').default,
    url: 'https://chat.openai.com/',
    // ChatGPT 支持 URL 参数传递 prompt
    supportsUrlParam: true,
    getUrl: (prompt) => `https://chat.openai.com/?hints=search&q=${encodeURIComponent(prompt)}`,
  },
  {
    key: 'kimi',
    name: '询问Kimi',
    favicon: require('@site/assets/icons/kimi.png').default,
    url: 'https://kimi.moonshot.cn/',
    // Kimi 不支持 URL 参数，需要手动粘贴
    supportsUrlParam: false,
  },
  {
    key: 'deepseek',
    name: '询问DeepSeek',
    favicon: require('@site/assets/icons/deepseek.png').default,
    url: 'https://chat.deepseek.com/',
    // DeepSeek 不支持 URL 参数，需要手动粘贴
    supportsUrlParam: false,
  },
  {
    key: 'perplexity',
    name: '询问Perplexity',
    favicon: require('@site/assets/icons/perplexity.png').default,
    url: 'https://www.perplexity.ai/',
    // Perplexity 支持 URL 参数
    supportsUrlParam: true,
    getUrl: (prompt) => `https://www.perplexity.ai/?q=${encodeURIComponent(prompt)}`,
  },
];

// TODO move to design system folder
function BreadcrumbsItemLink({ children, href, isLast }) {
  const className = 'breadcrumbs__link';
  if (isLast) {
    return <span className={className}>{children}</span>;
  }
  return href ? (
    <Link className={className} href={href}>
      <span>{children}</span>
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

// TODO move to design system folder
function BreadcrumbsItem({ children, active }) {
  return (
    <li
      className={clsx('breadcrumbs__item', {
        'breadcrumbs__item--active': active,
      })}>
      {children}
    </li>
  );
}

// 根据当前路由获取原始 Markdown 文件路径
function getRawMarkdownPath(pathname) {
  // pathname 格式: /docs/Lab1/Lab1_Detailed 或 /notes/intro
  // 转换为: /raw/docs/Lab1/Lab1_Detailed.md

  // 移除尾部斜杠
  let path = pathname.replace(/\/$/, '');

  // 处理根路径
  if (path === '' || path === '/') {
    return '/raw/docs/intro.md';
  }

  // 添加 /raw 前缀和 .md 后缀（使用 .md 而非 .mdx 以确保 GitHub Pages 正确设置 charset）
  return `/raw${path}.md`;
}

// 复制 Markdown 按钮组件
function CopyMarkdownButton() {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const [loading, setLoading] = useState(false);

  const rawPath = getRawMarkdownPath(location.pathname);

  // 获取完整的页面 URL
  const getFullPageUrl = useCallback(() => {
    const baseUrl = siteConfig.url || window.location.origin;
    return `${baseUrl}${location.pathname}`;
  }, [siteConfig.url, location.pathname]);

  // 生成 AI Prompt
  const generateAiPrompt = useCallback((pageUrl) => {
    return `请访问以下页面，并总结介绍其内容：${pageUrl}`;
  }, []);

  const handleCopy = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(rawPath);
      if (!response.ok) {
        throw new Error('无法获取源文件');
      }
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      message.success('已复制 Markdown 内容');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请尝试直接查看源文件');
    } finally {
      setLoading(false);
    }
  }, [rawPath]);

  const handleView = useCallback(() => {
    window.open(rawPath, '_blank');
  }, [rawPath]);

  // 打开 AI 服务
  const handleOpenAI = useCallback(async (service) => {
    const pageUrl = getFullPageUrl();
    const prompt = generateAiPrompt(pageUrl);

    if (service.supportsUrlParam && service.getUrl) {
      // 支持 URL 参数的服务，直接跳转
      const aiUrl = service.getUrl(prompt);
      window.open(aiUrl, '_blank');
    } else {
      // 不支持 URL 参数的服务，先复制 Prompt 再打开
      try {
        await navigator.clipboard.writeText(prompt);
        message.success(`已复制提问内容，正在打开 ${service.name}...`);
        // 延迟一小段时间让用户看到提示
        setTimeout(() => {
          window.open(service.url, '_blank');
        }, 2000);
      } catch (error) {
        console.error('复制失败:', error);
        message.warning('复制失败，请手动复制提问内容');
        window.open(service.url, '_blank');
      }
    }
  }, [getFullPageUrl, generateAiPrompt]);

  const menuItems = [
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: '复制页面',
      onClick: handleCopy,
    },
    {
      key: 'view',
      icon: <FileTextOutlined />,
      label: '查看源文件',
      onClick: handleView,
    },
    {
      type: 'divider',
    },
    // AI 服务菜单项
    ...AI_SERVICES.map((service) => ({
      key: service.key,
      icon: <img src={service.favicon} alt={service.name} className={styles.aiFavicon} />,
      label: (
        <span className={styles.aiMenuItem}>
          {service.name}
          <ExportOutlined className={styles.externalIcon} />
        </span>
      ),
      onClick: () => handleOpenAI(service),
    })),
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <button
        className={styles.copyButton}
        disabled={loading}
        aria-label="复制页面"
      >
        <CopyOutlined />
        <span className={styles.copyButtonText}>复制页面</span>
        <DownOutlined className={styles.copyButtonArrow} />
      </button>
    </Dropdown>
  );
}

export default function DocBreadcrumbs() {
  const breadcrumbs = useSidebarBreadcrumbs();
  const homePageRoute = useHomePageRoute();
  if (!breadcrumbs) {
    return null;
  }
  return (
    <>
      <DocBreadcrumbsStructuredData breadcrumbs={breadcrumbs} />
      <nav
        className={clsx(
          ThemeClassNames.docs.docBreadcrumbs,
          styles.breadcrumbsContainer,
        )}
        aria-label={translate({
          id: 'theme.docs.breadcrumbs.navAriaLabel',
          message: 'Breadcrumbs',
          description: 'The ARIA label for the breadcrumbs',
        })}>
        <ul className="breadcrumbs">
          {homePageRoute && <HomeBreadcrumbItem />}
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const href =
              item.type === 'category' && item.linkUnlisted
                ? undefined
                : item.href;
            return (
              <BreadcrumbsItem key={idx} active={isLast}>
                <BreadcrumbsItemLink href={href} isLast={isLast}>
                  {item.label}
                </BreadcrumbsItemLink>
              </BreadcrumbsItem>
            );
          })}
        </ul>
        <CopyMarkdownButton />
      </nav>
    </>
  );
}
