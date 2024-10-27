import React from 'react';
import {DotChartOutlined, ExperimentOutlined} from "@ant-design/icons";

const iconStyle = { color: '#006d75', fontSize: 26, marginRight: '4px' };
const iconMap = {
    lab: <DotChartOutlined />,
    tryout: <ExperimentOutlined />,
    default: <ExperimentOutlined />
};

const IconHeader = (props) => {
    const {icon, title, type} = props;
    const iconSelected = icon ? icon : (type ? iconMap[type] : iconMap['default']);
    return (
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
            {iconSelected && <span style={iconStyle}>{iconSelected}</span>}
            <h3 style={{margin: 0, display: 'flex', alignItems: 'center', color: '#006d75', fontSize: 18}}>
                {title}
            </h3>
        </div>
    )
}

export default IconHeader;
