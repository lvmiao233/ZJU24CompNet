import {Badge, Table} from "antd";
import React from "react";
import courseWorkData from "./data";

// 实现一个简单的函数，判断当前时间在传入的YYYY-MM-DD HH:MM:SS 格式的时间范围前、中还是后，分别返回状态为default/processing/error的badge
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
    const expandedRowRender = (idx) => {
        console.log(idx);
        const columns = [{
            title: '任务名称', dataIndex: 'name', key: 'name',
        }, {
            title: '开始时间', dataIndex: 'start', key: 'start',
        }, {
            title: '截止时间', dataIndex: 'end', key: 'end',
        }, {
            title: '状态', key: 'state', render: (row) => getBadgeStatus(row.start, row.end),
        }, ];
        return <Table columns={columns} dataSource={courseWorkData['detail'][idx.key]} pagination={false}/>;
    };
    const columns = [{
        title: '项目', dataIndex: 'name', key: 'name',
    }, {
        title: '数量', dataIndex: 'cnt', key: 'cnt',
    }, {
        title: '成绩占比', dataIndex: 'ratio', key: 'ratio',
    }];
    return (
        <Table
            columns={columns}
            expandable={{
                expandedRowRender
            }}
            pagination={false}
            dataSource={courseWorkData["items"]}
            size={'small'}
        />
    );
};


