import { Collapse } from 'antd';
import React from "react";

const collapseStyle = {fontSize: 15, marginBottom: 0, whiteSpace: "pre-line"};

const MappedCollapse = (props) => {
    const { items, defaultActiveKey, extras, size } = props;
    const mappedItems = Object.keys(items).map(key => ({
        key, label: key,
        children: Array.isArray(items[key]) ? (
            <>
                {items[key].map((item, index) => (
                    <React.Fragment key={index}>
                        {typeof item === 'string' ? <p style={collapseStyle}>{item}</p> : item}
                    </React.Fragment>
                ))}
            </>
        ) : (
            <React.Fragment key={1}>
                {typeof items[key] === 'string' ? <p style={collapseStyle}>{items[key]}</p> : items[key]}
            </React.Fragment>
        ),
        extra: extras && extras[key]
    }));
    const sizeSelected = size ? size : 'default';
    return (
        <Collapse items={mappedItems} defaultActiveKey={defaultActiveKey} size={sizeSelected}/>
    );
}

export default MappedCollapse;

