import {Alert, Badge, Table} from "antd";
import React from "react";
import courseWorkData from "@site/src/compData/courseWork.js";

export const taskColumns = [
    { title: '任务名称', dataIndex: 'name', key: 'name', },
    { title: '建议开始时间', dataIndex: 'start', key: 'start', },
    { title: '建议截止时间', dataIndex: 'end', key: 'end', },
    { title: '状态', key: 'state', render: (row) => getBadgeStatus(row.start, row.end), }
];

const getBadgeStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate) {
        return <Badge status='default' text={'未开始'}/>;
    } else if (now > endDate) {
        return <Badge status='error' text={'已结束'}/>;
    } else {
        return <Badge status='processing' text={'进行中'}/>;
    }
};

export default function CourseWorkTable() {
    const columns = [
        { title: '项目', dataIndex: 'name', key: 'name', },
        { title: '数量', dataIndex: 'cnt', key: 'cnt', },
        { title: '成绩占比', dataIndex: 'ratio', key: 'ratio', }
    ];
    return (
        <>
            <Alert message="Quiz时间尚未更新，请以钉钉群通知及网上作业系统为准" type="warning" showIcon />
            <Table
                columns={columns}
                expandable={{
                    expandedRowRender: (idx) => (<Table columns={taskColumns} dataSource={courseWorkData['detail'][idx.key]} pagination={false}/>)
                }}
                pagination={false}
                dataSource={courseWorkData["items"]}
                size={'small'}
                style={{marginTop: 12}}
            />
        </>
    );
};