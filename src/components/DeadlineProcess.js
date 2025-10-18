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
    return '#08979c';
};

const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    marginTop: 12
};

const headerStyle = {
    margin: 0,
    display: 'flex',
    alignItems: 'center'
};

const progressContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 8,
    marginBottom: 12
};

const progressRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const progressStyle = {
    margin: '6px 0',
    height: 20
};

const DeadlineProcess = (props) => {
    const { start, end } = props;
    const process = deadlineProgress(start, end);
    return (
        process === 100 ?
            <div style={containerStyle}>
                <FieldTimeOutlined style={{ fontSize: 22, marginRight: '4px' }} />
                <h5 style={headerStyle}>
                    已超过建议完成时间，请务必在2025-12-30前提交该实验报告与数据
                </h5>
            </div>
            :
            <div style={progressContainerStyle}>
                <div style={progressRowStyle}>
                    <span>{start}</span>
                    <span>&gt;&gt;&gt;</span>
                    <span>{end}</span>
                </div>
                <Progress
                    percent={process}
                    showInfo={false}
                    strokeColor={strokeColor(process)}
                    style={progressStyle}
                />
            </div>
    );
}

export default DeadlineProcess;