// import { PageContainer, ProTable } from '@ant-design/pro-components';
// import React from 'react';

// const TermList = () => {
//     const columns = [
//         {
//             title: '英文词汇',
//             dataIndex: 'term',
//         },
//         {
//             title: '中文翻译',
//             dataIndex: 'translation',
//         },
//         {
//             title: '章节位置',
//             dataIndex: 'chap',
//         },
//     ];

//     const dataC = [{ term: 'A', translation: 'B', chap: 'C' },];

//     return (

//         <ProTable
//             headerTitle={'回放列表'}
//             rowKey="key"
//             // search={{
//             //   labelWidth: 120,
//             // }}
//             columns={columns}
//             dataSource={dataC}
//             style={{ width: '100%' }}
//         />
//     );
// };

// export default TermList;
import React from 'react';
import { Space, Table, Tag } from 'antd';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];
const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];
const TermList = () => <Table columns={columns} dataSource={data} />;
export default TermList;