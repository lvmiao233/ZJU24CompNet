import React from 'react';
import {Card} from 'antd';

export const LinkCard = ({title, url, children}) => (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Card title={title} to={url}>{children}</Card>
    </a>
);

export default LinkCard;