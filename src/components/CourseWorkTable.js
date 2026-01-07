import React from 'react';
import { Collapse } from 'antd';
import courseWorkData from '@site/src/data/courseWork.js';
import CourseWorkList from './CourseWorkList';

const CourseWorkTable = () => (
    <Collapse
        style={{ marginTop: 12 }}
        items={courseWorkData.items.map((item, index) => ({
            key: index.toString(),
            label: item.name,
            extra: `共${item.cnt}次  占比${item.ratio}`,
            children: <CourseWorkList items={courseWorkData.detail[item.key]} />
        }))}
    />
);

export default CourseWorkTable;
