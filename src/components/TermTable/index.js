import React from 'react';
import { Table } from 'antd';
import Terms from '@site/src/compData/terms.js';

const termColumns = [
    {
        title: '术语缩写',
        dataIndex: 'term',
        key: 'term',
        render: (text, record) => (
            <a href={`https://zh.wikipedia.org/wiki/${record.link}`} target="_blank" rel="noopener noreferrer">
                {text}
            </a>
        ),
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