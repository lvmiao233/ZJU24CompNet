import { Collapse } from 'antd';
import React from "react";

const collapseStyle = {fontSize: 15, marginBottom: 0, whiteSpace: "pre-line"};

const MappedCollapse = (props) => {
    const { items, defaultActiveKey, extras } = props;
    console.log(extras);
    const mappedItems = Object.keys(items).map(key => ({
        key, label: key,
        children: <p style={collapseStyle}>{items[key]}</p>,
        extra: extras && extras[key]
    }));
    return (
        <Collapse items={mappedItems} defaultActiveKey={defaultActiveKey} />
    );
}

export default MappedCollapse;

