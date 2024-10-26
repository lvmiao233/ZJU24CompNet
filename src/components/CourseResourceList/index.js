import {Col, Row} from 'antd';
import React from 'react';
import resourceData from "@site/src/compData/courseResource.js";
import FileCard from "../FileCard";

const CourseResourceList = () => (
    <Row gutter={[16, 4]} justify="space-between">
        {resourceData.map((item, index) => (
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <FileCard key={index} file_type={item.file_type} name={item.name} size={item.size} link={item.link}/>
            </Col>
        ))}
    </Row>
);
export default CourseResourceList;

