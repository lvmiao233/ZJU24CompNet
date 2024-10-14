import {
    CloudDownloadOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FilePptOutlined,
    FileTextOutlined,
    FileWordOutlined,
} from '@ant-design/icons';
import {ProCard} from '@ant-design/pro-components';
import {Col, Row, Typography} from 'antd';
import React from 'react';
import resourceData from "@site/src/components/CourseResourceList/data.js";

const {Title, Paragraph} = Typography;
const getFileIcon = (type) => {
    if (type === 'pdf')
        return <FilePdfOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    if (type === 'xls' || type === 'xlsx')
        return <FileExcelOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    if (type === 'doc' || type === 'docx')
        return <FileWordOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    if (type === 'ppt' || type === 'pptx')
        return <FilePptOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    return <FileTextOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
};

const convertSize = (byte) => {
    let size = '';
    if (!byte) return '0B';
    if (byte < 0.1 * 1024) size = `${byte.toFixed(2)}B`;
    else if (byte < 0.1 * 1024 * 1024) size = `${(byte / 1024).toFixed(2)}KB`;
    else if (byte < 0.1 * 1024 * 1024 * 1024) size = `${(byte / (1024 * 1024)).toFixed(2)}MB`;
    else size = `${(byte / (1024 * 1024 * 1024)).toFixed(2)}GB`;

    const sizeStr = `${size}`; // 转成字符串
    const index = sizeStr.indexOf('.'); // 获取小数点处的索引
    const dou = sizeStr.substr(index + 1, 2); // 获取小数点后两位的值
    // eslint-disable-next-line eqeqeq
    if (dou === '00') return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
    return size;
};

const CourseResourceList = () => (
    <ProCard
        bodyStyle={{paddingLeft: 0, paddingRight: 0}}
        gutter={[14]}
        style={{padding: 0}}
        wrap={true}>
        {resourceData.map((item, index) => (
                <ProCard
                    key={index}
                    bordered={true}
                    split={'horizontal'}
                    type={'inner'}
                    
                    hoverable={true}
                    colSpan={{xs: 24, sm: 24, md: 24, lg: 12, xl: 12}}
                    style={{paddingLeft: 15, paddingRight: 20, paddingTop: 15, paddingBottom: 18, marginBottom: 10, border: '1px solid #dcdcdc'}}
                >
                    <a href={item.link} style={{textDecoration: 'none', color: 'inherit'}}>
                        <Row>
                            <Col span={1} style={{minHeight: '100%'}}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    {getFileIcon(item.file_type)}
                                </div>
                            </Col>
                            <Col span={22}>
                                <div style={{paddingLeft: 24}}>
                                    <Title level={5} style={{marginBottom: 8, marginTop: 0}}>{item.name}</Title>
                                    <span>{convertSize(item.size)}</span>
                                </div>
                            </Col>
                            <Col span={1} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <CloudDownloadOutlined style={{fontSize: '20px'}}/>
                            </Col>
                        </Row>
                    </a>
                </ProCard>
            )
        )}
    </ProCard>
);
export default CourseResourceList;

