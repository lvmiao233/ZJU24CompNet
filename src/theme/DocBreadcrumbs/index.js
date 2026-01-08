import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useSidebarBreadcrumbs } from '@docusaurus/plugin-content-docs/client';
import { useHomePageRoute } from '@docusaurus/theme-common/internal';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import HomeBreadcrumbItem from '@theme/DocBreadcrumbs/Items/Home';
import DocBreadcrumbsStructuredData from '@theme/DocBreadcrumbs/StructuredData';
import { Dropdown, message } from 'antd';
import { CopyOutlined, FileTextOutlined, DownOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

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
  // 转换为: /raw/docs/Lab1/Lab1_Detailed.mdx

  // 移除尾部斜杠
  let path = pathname.replace(/\/$/, '');

  // 处理根路径
  if (path === '' || path === '/') {
    return '/raw/docs/intro.mdx';
  }

  // 添加 /raw 前缀和 .mdx 后缀
  return `/raw${path}.mdx`;
}

// 复制 Markdown 按钮组件
function CopyMarkdownButton() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const rawPath = getRawMarkdownPath(location.pathname);

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
