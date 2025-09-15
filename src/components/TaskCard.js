import React from 'react';
import '@site/src/css/TaskCard.css';
import { CameraOutlined, CodeOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const TaskCard = ({ number, title, children, needScreenshot = true, needRecord = false }) => {
    return (
        <div className="task-card">
            <div className="task-card-header">
                <div className="task-card-title-group">
                    <div className="task-number-circle">
                        <span>{number}</span>
                    </div>
                    <h3 className="task-title">{title}</h3>
                </div>
                <div className="task-card-icons">
                    {needScreenshot && <Tooltip title="本步骤需要截图"><CameraOutlined /></Tooltip>}
                    {needRecord && <Tooltip title="本步骤需要记录命令"><CodeOutlined /></Tooltip>}
                </div>
            </div>
            <div className="task-card-content">
                {children}
            </div>
        </div>
    );
};

export default TaskCard;