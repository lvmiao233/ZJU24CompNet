import {Card, Col, Row, Typography} from "antd";
import React, { useMemo } from 'react';
import {
    AntCloudOutlined,
    CloudDownloadOutlined,
    FileExcelOutlined,
    FileMarkdownOutlined,
    FilePdfOutlined,
    FilePptOutlined,
    FileTextOutlined,
    FileWordOutlined,
    GithubOutlined,
} from '@ant-design/icons';

const {Title} = Typography;

const iconStyle = {color: '#006d75', fontSize: 40};

const getFileIcon = (type) => {
    if (type === 'pdf') return <FilePdfOutlined style={iconStyle}/>;
    if (type === 'xls' || type === 'xlsx') return <FileExcelOutlined style={iconStyle}/>;
    if (type === 'doc' || type === 'docx') return <FileWordOutlined style={iconStyle}/>;
    if (type === 'ppt' || type === 'pptx') return <FilePptOutlined style={iconStyle}/>;
    if (type === 'md' || type === 'mdx') return <FileMarkdownOutlined style={iconStyle}/>;
    if (type === 'cloud') return <AntCloudOutlined style={iconStyle}/>;
    if (type === 'github') return <GithubOutlined style={iconStyle}/>;
    return <FileTextOutlined style={iconStyle}/>;
};

const convertSize = (byte) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    const powersOf1024 = [1, 1024, 1024 * 1024, 1024 * 1024 * 1024];
    let unitIndex = Math.min(Math.floor(Math.log(byte) / Math.log(1024)), units.length - 1);
    const size = (byte / powersOf1024[unitIndex]).toPrecision(3);

    const sizeStr = `${size}${units[unitIndex]}`;
    const index = sizeStr.indexOf('.'); // 获取小数点处的索引
    const dou = sizeStr.slice(index + 1, index + 3); // 获取小数点后两位的值
    if (dou === '00') return `${sizeStr.slice(0, index)}${sizeStr.slice(index + 3)}`;
    return sizeStr;
};

const cardStyle = {
    paddingLeft: 6, marginBottom: 10,
    border: '1px solid #dcdcdc', minHeight: '86px'
};
const iconContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
};
const contentStyle = { paddingLeft: 24 };
const titleStyle = { marginBottom: 8, marginTop: 0 };
const downloadIconStyle = { fontSize: '20px' };

const FileCard = (props) => {
    const {file_type, name, size, link} = props;
    const fileIcon = useMemo(() => getFileIcon(file_type), [file_type]); // 缓存文件图标
    const fileSize = useMemo(() => convertSize(size), [size]); // 缓存文件大小

    return (
        <a href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card bordered={true} hoverable={true} type={'inner'} style={cardStyle} >
                <Row>
                    <Col span={1} style={{ minHeight: '100%' }}>
                        <div style={iconContainerStyle}> {fileIcon} </div>
                    </Col>
                    <Col span={22}>
                        <div style={contentStyle}>
                            <Title level={5} style={titleStyle}>{name}</Title>
                            <span>{fileSize}</span>
                        </div>
                    </Col>
                    <Col span={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <CloudDownloadOutlined style={downloadIconStyle} />
                    </Col>
                </Row>
            </Card>
        </a>
    );
}

export default FileCard;
