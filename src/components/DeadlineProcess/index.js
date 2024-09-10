import {Progress} from 'antd';
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
    const {start, end} = props;
    return (
        <div style={{display: 'flex', flexDirection: 'column', paddingTop: 8, marginBottom: 12}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>{start}</span>
                <span>{'>>>'}</span>
                <span>{end}</span>
            </div>
            <Progress
                percent={deadlineProgress(start, end)}
                showInfo={false}
                strokeColor={strokeColor(deadlineProgress(start, end))}
                style={{margin: '6px 0'}}
            />
        </div>
    );
}

export default DeadlineProcess;