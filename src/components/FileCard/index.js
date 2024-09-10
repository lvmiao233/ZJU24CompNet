import {ProCard} from "@ant-design/pro-components";
import {Col, Row} from "antd";
import React from "react";
import {
    FileExcelOutlined,
    FilePdfOutlined,
    FilePptOutlined,
    FileTextOutlined,
    FileWordOutlined,
    FileMarkdownOutlined,
} from '@ant-design/icons';

const getFileIcon = (type) => {
    if (type === 'pdf')
        return <FilePdfOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    if (type === 'xls' || type === 'xlsx')
        return <FileExcelOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    if (type === 'doc' || type === 'docx')
        return <FileWordOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    if (type === 'ppt' || type === 'pptx')
        return <FilePptOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
    if (type === 'md' || type === 'mdx')
        return <FileMarkdownOutlined style={{color: '#006d75', fontSize: 40, marginTop: 7}}/>;
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

const FileCard = (props) => {
    const {file_type, name, size, link} = props;
    return (
        <ProCard
            // key={1}
            bordered={true}
            split={'horizontal'}
            type={'inner'}
            colSpan={12}
            style={{
                paddingLeft: 15,
                paddingRight: 20,
                paddingTop: 15,
                paddingBottom: 18,
                marginBottom: 10,
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Row>
                <Col span={1}>{getFileIcon(file_type)}</Col>
                <Col style={{marginLeft: 30}} span={21}>
                    <>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span style={{fontWeight: 500}}>{name}</span>
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <a href={link} style={{color: '#006d75'}}>
                                    下载
                                </a>
                            </div>
                        </div>
                        <span style={{color: '#7d7d7d'}}>{convertSize(size)}</span>
                    </>
                </Col>
            </Row>
        </ProCard>)
}

export default FileCard;