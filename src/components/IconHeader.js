import React from 'react';
import { DotChartOutlined, ExperimentOutlined } from "@ant-design/icons";
import '../css/components.css';

const iconMap = {
    lab: <DotChartOutlined />,
    tryout: <ExperimentOutlined />,
    default: <ExperimentOutlined />
};

const IconHeader = (props) => {
    const { icon, title, type, size } = props;
    const iconSelected = icon ? icon : (type ? iconMap[type] : iconMap['default']);
    return (
        <div className="icon-header">
            {iconSelected && <span className="icon-header-icon">{iconSelected}</span>}
            {(size && size === "h2") ?
                <h2 className="icon-header-title icon-header-h2">{title}</h2> :
                <h3 className="icon-header-title icon-header-h3">{title}</h3>
            }
        </div>
    )
}

export default IconHeader;

