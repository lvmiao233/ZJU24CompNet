import { useState, useMemo } from 'react';
import { RightOutlined, LinkOutlined } from "@ant-design/icons";
import '../css/components.css';

// 从 URL 提取域名
const extractDomain = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return null;
    }
};

// 使用 DuckDuckGo 的 favicon 服务（中国大陆可访问）
const getFaviconUrl = (domain) => {
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
};

export const LinkCard = ({ title, url, icon, children }) => {
    const [faviconError, setFaviconError] = useState(false);

    // 计算要使用的图标 URL
    const iconSrc = useMemo(() => {
        // 如果明确提供了 icon，使用它
        if (icon) return icon;

        // 否则尝试从 URL 获取 favicon
        const domain = extractDomain(url);
        if (domain) {
            return getFaviconUrl(domain);
        }
        return null;
    }, [icon, url]);

    // 处理图标加载失败
    const handleIconError = () => {
        setFaviconError(true);
    };

    // 渲染图标
    const renderIcon = () => {
        if (faviconError || !iconSrc) {
            // 加载失败或无图标时显示默认 LinkOutlined 图标
            return <LinkOutlined className="link-card-fallback-icon" />;
        }
        return (
            <img
                src={iconSrc}
                alt={title ? `${title} 图标` : '链接图标'}
                className="link-card-icon"
                onError={handleIconError}
            />
        );
    };

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="link-card-anchor">
            <div className="link-card">
                <div className="link-card-content">
                    <div className="link-card-icon-wrapper">
                        {renderIcon()}
                    </div>
                    <div className="link-card-info">
                        <h5 className="link-card-title">{title}</h5>
                        {children && <span className="link-card-desc">{children}</span>}
                    </div>
                    <div className="link-card-arrow">
                        <RightOutlined />
                    </div>
                </div>
            </div>
        </a>
    );
};

export default LinkCard;
