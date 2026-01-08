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
import '@site/src/css/components.css';

const FileCard = (props) => {
    const { file_type, name, size, link } = props;

    const getFileIcon = (type) => {
        const iconClass = "file-card-icon";
        if (type === 'pdf') return <FilePdfOutlined className={iconClass} />;
        if (type === 'xls' || type === 'xlsx') return <FileExcelOutlined className={iconClass} />;
        if (type === 'doc' || type === 'docx') return <FileWordOutlined className={iconClass} />;
        if (type === 'ppt' || type === 'pptx') return <FilePptOutlined className={iconClass} />;
        if (type === 'md' || type === 'mdx') return <FileMarkdownOutlined className={iconClass} />;
        if (type === 'cloud') return <AntCloudOutlined className={iconClass} />;
        if (type === 'github') return <GithubOutlined className={iconClass} />;
        return <FileTextOutlined className={iconClass} />;
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

    const fileIcon = useMemo(() => getFileIcon(file_type), [file_type]);
    const fileSize = useMemo(() => convertSize(size), [size]);

    return (
        <a href={link} className="file-card-link">
            <div className="file-card">
                <div className="file-card-content">
                    <div className="file-card-icon-wrapper">
                        {fileIcon}
                    </div>
                    <div className="file-card-info">
                        <h5 className="file-card-name">{name}</h5>
                        <span className="file-card-size">{fileSize}</span>
                    </div>
                    <div className="file-card-download">
                        <CloudDownloadOutlined />
                    </div>
                </div>
            </div>
        </a>
    );
}

export default FileCard;
