import React from 'react';
import { RightOutlined } from "@ant-design/icons";
import '../css/components.css';

export const LinkCard = ({ title, url, icon, children }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="link-card-anchor">
        <div className="link-card">
            <div className="link-card-content">
                <div className="link-card-icon-wrapper">
                    {icon && <img src={icon} alt={title ? `${title} 图标` : '链接图标'} className="link-card-icon" />}
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

export default LinkCard;
