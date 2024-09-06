import React from 'react';
import { Space, Table, Tag } from 'antd';
import Terms from '@site/src/components/TermTable/terms.js';

const termColumns = [
    {
        title: '术语缩写',
        dataIndex: 'term',
        key: 'term',
        render: (text) => <a>{text}</a>,
        sorter: (a, b) => a.term > b.term,
    },
    {
        title: '全称',
        dataIndex: 'full',
        key: 'full',
    },
    {
        title: '所属层级',
        key: 'layers',
        dataIndex: 'layer',
        sorter: (a, b) => a.layer > b.layer,
        onFilter: (value, record) => record.name.indexOf(value) === 0,
    },
    {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
    },
];

const TermList = () =>
    <Table
        columns={termColumns}
        dataSource={Terms}
        pagination={false}
    />;

export default TermList;