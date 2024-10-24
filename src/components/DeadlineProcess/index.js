import { Progress } from 'antd';
import {FieldTimeOutlined} from "@ant-design/icons";
import React from 'react';

const deadlineProgress = (begin, end) => {
    if (!begin || !end) return 0;
    const deadline = new Date(end);
    const start = new Date(begin);
    const now = new Date();
    const progress =
        (100 * (now.getTime() - start.getTime())) / (deadline.getTime() - start.getTime());
    return Math.max(Math.min(progress, 100), 0);
};

const strokeColor = (progress) => {
    if (progress >= 75) return '#ff4d4f';
    if (progress >= 50) return '#ffa940';
    return '#13c2c2';
};


const DeadlineProcess = (props) => {
    const { start, end } = props;
    const process = deadlineProgress(start, end);
    return (
        process === 100 ?
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', marginTop: 12 }}>
                {<FieldTimeOutlined style={{  fontSize: 22, marginRight: '4px' }} />}
                <h5 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    {"已超过建议完成时间，请务必在2024-12-29前提交该实验报告与数据"}
                </h5>
            </div>
            :
            <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{start}</span>
                    <span>{'>>>'}</span>
                    <span>{end}</span>
                </div>
                <Progress
                    percent={process}
                    showInfo={false}
                    strokeColor={strokeColor(process)}
                    style={{ margin: '6px 0' }}
                />
            </div>
    );
}

export default DeadlineProcess;