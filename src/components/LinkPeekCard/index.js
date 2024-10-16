import React, {useState} from 'react';
import {Avatar, Card, Col, Row, Typography} from 'antd';
import {DownOutlined, RightOutlined, UpOutlined} from "@ant-design/icons";

const {Title, Paragraph} = Typography;

export const LinkPeekCard = ({title, url, icon, children}) => {
    const [showPeek, setShowPeek] = useState(false);

    const cardStyle = {
        width: '100%', paddingBottom: -30, marginTop: -40, position: 'relative', zIndex: 0, // 默认层级
        backgroundColor: '#f5f5f5', border: '1px solid #dcdcdc'
    };
    const peekCardStyle = {...cardStyle, padding: 0, height: '1118px'};
    const buttonStyle = {
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', color: '#333', paddingBottom: -20, marginBottom: -17
    };

    return (<div>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit'}}>
            <Card
                hoverable={true}
                style={{ width: '100%', paddingBottom: -20, border: '1px solid #dcdcdc', position: 'relative', zIndex: 1 }}
            >
                <Row gutter={[0, 0]}>
                    <Col span={2}>
                        <Avatar
                            shape="square" style={{backgroundColor: '#f5f5f5'}}
                            size={{xs: 28, sm: 32, md: 40, lg: 32, xl: 48, xxl: 50}}
                            src={<img src={icon} alt="avatar" style={{maxWidth: '75%', maxHeight: '75%', objectFit: 'contain'}}/>}
                        />
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
        </a>
        {showPeek ? (<Card style={peekCardStyle}>
            <iframe src={url} style={{ width: '100%', height: '1050px', border: 'none', paddingTop: 25, }} />
            <div style={{...buttonStyle, paddingTop: 3}} onClick={() => setShowPeek(false)} >
                <UpOutlined style={{fontSize: '18px', marginBottom: '0px', marginRight: 4}}/>
                <span>收起预览</span>
            </div>
        </Card>) : (<Card style={cardStyle} onClick={() => setShowPeek(true)}>
            <div style={{...buttonStyle, paddingTop: 20}} >
                <DownOutlined style={{fontSize: '18px', marginBottom: '0px', marginRight: 4}}/>
                <span>预览页面</span>
            </div>
        </Card>)}
    </div>);
}


export default LinkPeekCard;