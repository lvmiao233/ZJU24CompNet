import {Card, Col, Row, Typography} from "antd";
import React from "react";
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

const {Title, Paragraph} = Typography;
const getFileIcon = (type) => {
    if (type === 'pdf') return <FilePdfOutlined style={{color: '#006d75', fontSize: 40}}/>;
    if (type === 'xls' || type === 'xlsx') return <FileExcelOutlined style={{color: '#006d75', fontSize: 40}}/>;
    if (type === 'doc' || type === 'docx') return <FileWordOutlined style={{color: '#006d75', fontSize: 40}}/>;
    if (type === 'ppt' || type === 'pptx') return <FilePptOutlined style={{color: '#006d75', fontSize: 40}}/>;
    if (type === 'md' || type === 'mdx') return <FileMarkdownOutlined style={{color: '#006d75', fontSize: 40}}/>;
    if (type === 'cloud') return <AntCloudOutlined style={{color: '#006d75', fontSize: 40}}/>;
    if (type === 'github') return <GithubOutlined style={{color: '#006d75', fontSize: 40}}/>;
    return <FileTextOutlined style={{color: '#006d75', fontSize: 40}}/>;
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

const FileCard = (props) => {
    const {file_type, name, size, link} = props;
    return (<a href={link} style={{textDecoration: 'none', color: 'inherit'}}>
            <Card
                bordered={true}
                type={'inner'}
                hoverable={true}
                style={{paddingLeft: 6, marginBottom: 10, border: '1px solid #dcdcdc'}}
            >
                <Row>
                    <Col span={1} style={{minHeight: '100%'}}>
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                            {getFileIcon(file_type)}
                        </div>
                    </Col>
                    <Col span={22}>
                        <div style={{paddingLeft: 24}}>
                            <Title level={5} style={{marginBottom: 8, marginTop: 0}}>{name}</Title>
                            <span>{convertSize(size)}</span>
                        </div>
                    </Col>
                    <Col span={1} style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <CloudDownloadOutlined style={{fontSize: '20px'}}/>
                    </Col>
                </Row>
            </Card>
        </a>)
}

export default FileCard;