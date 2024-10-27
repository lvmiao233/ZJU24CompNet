import React from 'react';
import {DotChartOutlined, ExperimentOutlined} from "@ant-design/icons";

const iconStyle = { color: '#006d75', fontSize: 26, marginRight: '6px' };
const textStyle = { margin: 0, display: 'flex', alignItems: 'center', color: '#006d75' };
const iconMap = {
    lab: <DotChartOutlined />,
    tryout: <ExperimentOutlined />,
    default: <ExperimentOutlined />
};

const IconHeader = (props) => {
    const {icon, title, type, size} = props;
    const iconSelected = icon ? icon : (type ? iconMap[type] : iconMap['default']);
    return (
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '5px'}}>
            {iconSelected && <span style={iconStyle}>{iconSelected}</span>}
            {(size && size === "h2") ?
                <h2 style={{...textStyle, fontSize: 24}}> {title} </h2> :
                <h3 style={{...textStyle, fontSize: 18}}> {title} </h3>
            }
        </div>
    )
}

export default IconHeader;
