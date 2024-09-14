import React from 'react';
import {Avatar, Card, Col, Row, Typography} from 'antd';
import {RightOutlined} from "@ant-design/icons";

const {Title, Paragraph} = Typography;

export const LinkCard = ({title, url, icon, children}) => (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit'}}>
        <Card
            hoverable={true} // 鼠标悬停时有阴影效果
            style={{width: '100%', paddingBottom: -20}}
        >
            <Row gutter={[0, 0]}>
                <Col span={2}>
                    <Avatar
                        shape="square"
                        style={{backgroundColor: '#f5f5f5'}}
                        size={{xs: 28, sm: 32, md: 40, lg: 32, xl: 48, xxl: 50}}
                        src={<img src={icon} alt="avatar"
                                  style={{
                                      maxWidth: '75%', maxHeight: '75%', objectFit: 'contain',
                                  }}/>}/>
                </Col>
                <Col span={21}>
                    <Title level={5} style={{marginBottom: 8, marginTop: -4}}>{title}</Title>
                    <span>{children}</span>
                </Col>
                <Col span={1} style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <RightOutlined/>
                </Col>
            </Row>
        </Card>
    </a>);

export default LinkCard;