import React from 'react';
import { Badge } from 'antd';
import '../css/components.css';

const getBadgeStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate) return <Badge status='default' text={'未开始'} />;
    if (now > endDate) return <Badge status='error' text={'已结束'} />;
    return <Badge status='processing' text={'进行中'} />;
};

const CourseWorkList = ({ items }) => (
    <div className="coursework-list">
        {items.map((item, index) => (
            <div className="coursework-item" key={item.name || index}>
                <div className="coursework-name">{item.name}</div>
                <div className="coursework-date">
                    <span>{item.start}</span>
                    <span className="arrow">→</span>
                    <span>{item.end}</span>
                </div>
                <div className="coursework-status">
                    {getBadgeStatus(item.start, item.end)}
                </div>
            </div>
        ))}
    </div>
);

export default CourseWorkList;
