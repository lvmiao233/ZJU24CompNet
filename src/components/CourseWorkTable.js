import React from 'react';
import {Badge, Collapse, List, Col, Row} from 'antd';
import courseWorkData from '@site/src/data/courseWork.js';

const { Panel } = Collapse;

const getBadgeStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate)  return <Badge status='default' text={'未开始'} />;
    if (now > endDate) return <Badge status='error' text={'已结束'} />;
    return <Badge status='processing' text={'进行中'} />;
};

export const renderItem = (item) => (
    <List.Item>
        <Row justify="space-between" align="middle">
            <Col> <span style={{ fontWeight: 'bold' }}>{item.name}</span> </Col>
            <Col>
                <Row align="middle">
                    <Col> <span>{item.start}</span> </Col>
                    <Col> <span style={{ margin: '0 8px' }}> {">>"} </span> </Col>
                    <Col> <span>{item.end}</span> </Col>
                </Row>
            </Col>
            <Col> {getBadgeStatus(item.start, item.end)} </Col>
        </Row>
    </List.Item>
);

const CourseWorkTable = () => (
    <Collapse style={{ marginTop: 12}}>
        {courseWorkData.items.map((item, index) => (
            <Panel header={item.name} key={index.toString()} extra={`共${item.cnt}次  占比${item.ratio}`}>
                <List itemLayout="vertical" size="small" dataSource={courseWorkData.detail[item.key]} renderItem={renderItem} />
            </Panel>
        ))}
    </Collapse>
);

export default CourseWorkTable;
