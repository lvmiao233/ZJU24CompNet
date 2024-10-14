import {Alert, Badge, Table} from "antd";
import React from "react";
import LabDeadlineData from "./data";

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

export default function LabDeadlineTable() {
    const columns = [{
        title: '任务名称', dataIndex: 'name', key: 'name',
    }, {
        title: '建议开始时间', dataIndex: 'start', key: 'start',
    }, {
        title: '建议截止时间', dataIndex: 'end', key: 'end',
    }, {
        title: '状态', key: 'state', render: (row) => getBadgeStatus(row.start, row.end),
    },];
    return <Table columns={columns} dataSource={LabDeadlineData} pagination={false} size={'small'}/>;
};


