import React, { useState, useRef } from 'react';
import { Upload, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const SubmissionChecker = () => {
  const [validationResult, setValidationResult] = useState(null);
  const [fileList, setFileList] = useState([]);

  const getFileCategory = (fileName) => {
    if (fileName.endsWith('.pdf')) return 'report';
    if (['.zip', '.rar', '.7z'].some(ext => fileName.endsWith(ext))) return 'data';
    return 'illegal';
  };

  const parseFileName = (fileName) => {
    const regex = /^(\d{10})_([\u4e00-\u9fa5]+)_Lab([1-8])(?:_([12]))?\.(pdf|zip|rar|7z)$/i;
    const match = fileName.match(regex);
    if (!match) return null;
    return {
      fullName: fileName,
      studentId: match[1],
      name: match[2],
      lab: match[3],
      part: match[4], // undefined if not present
      ext: match[5],
      category: getFileCategory(fileName),
    };
  };

  const validateFiles = (files) => {
    const errors = [];

    if (files.length === 0) {
      setValidationResult(null);
      return;
    }

    if (files.length > 3) {
      errors.push('最多只能提交三个文件（1个报告PDF + 最多2个数据压缩包）。');
      setValidationResult({ success: false, errors });
      return;
    }

    const parsedFiles = files.map(f => ({ original: f, parsed: parseFileName(f.name) }));

    // Rule: Check for illegal file types and basic naming format
    parsedFiles.forEach(pf => {
      if (getFileCategory(pf.original.name) === 'illegal') {
        errors.push(`文件“${pf.original.name}”格式不支持，只允许上传 PDF、ZIP、RAR 或 7z 文件。`);
      } else if (!pf.parsed) {
        // More specific error for naming convention
        if (!/^\d{10}/.test(pf.original.name)) {
          errors.push(`文件名“${pf.original.name}”不符合规范：学号必须是10位数字。`);
        } else if (!/_Lab[1-8]/.test(pf.original.name)) {
          errors.push(`文件名“${pf.original.name}”不符合规范：实验序号必须是1-8之间的数字，并以“_Lab”为前缀。`);
        } else {
          errors.push(`文件名“${pf.original.name}”不符合基本命名规范（学号_姓名_LabX）。`);
        }
      }
    });

    if (errors.length > 0) {
      setValidationResult({ success: false, errors });
      return;
    }

    const validFiles = parsedFiles.filter(pf => pf.parsed).map(pf => pf.parsed);

    // Rule: All files must have consistent studentId, name, and lab number
    if (validFiles.length > 1) {
      const firstFile = validFiles[0];
      for (let i = 1; i < validFiles.length; i++) {
        if (validFiles[i].studentId !== firstFile.studentId || validFiles[i].name !== firstFile.name || validFiles[i].lab !== firstFile.lab) {
          errors.push('检测到多个文件的学号/姓名/实验序号不一致。');
          setValidationResult({ success: false, errors });
          return;
        }
      }
    }

    const reports = validFiles.filter(f => f.category === 'report');
    const dataPackages = validFiles.filter(f => f.category === 'data');

    // Scenario checks
    if (reports.length > 1) {
      errors.push('最多只能提交一份PDF实验报告。');
    }
    if (dataPackages.length > 2) {
      errors.push('最多只能提交两个数据压缩包。');
    }
    if (errors.length > 0) {
      setValidationResult({ success: false, errors });
      return;
    }

    // Case 1: 1 PDF + 1 data pack
    if (reports.length === 1 && dataPackages.length === 1) {
      if (reports[0].part) errors.push(`报告（PDF）文件名“${reports[0].fullName}”不应包含分卷号。`);
      if (dataPackages[0].part) errors.push(`提交单个数据包时，文件名“${dataPackages[0].fullName}”不应包含分卷号。`);
    }
    // Case 2: 1 PDF only
    else if (reports.length === 1 && dataPackages.length === 0) {
      if (reports[0].part) errors.push(`单独提交报告时，文件名“${reports[0].fullName}”不应包含分卷号。`);
    }
    // Case 3: 1 data pack only
    else if (reports.length === 0 && dataPackages.length === 1) {
      if (dataPackages[0].part) errors.push(`单独提交数据包时，文件名“${dataPackages[0].fullName}”不应包含分卷号。`);
    }
    // Case 4: 2 data packs
    else if (reports.length === 0 && dataPackages.length === 2) {
      const parts = dataPackages.map(f => f.part).sort();
      if (parts[0] !== '1' || parts[1] !== '2') {
        errors.push('提交两个压缩包时，必须是分卷压缩包，文件名需分别以 _1 和 _2 结尾。');
      }
    }
    // Case 5: 1 PDF + 2 data packs
    else if (reports.length === 1 && dataPackages.length === 2) {
      if (reports[0].part) errors.push(`报告（PDF）文件名“${reports[0].fullName}”不应包含分卷号。`);
      const dataParts = dataPackages.map(f => f.part).sort();
      if (dataParts[0] !== '1' || dataParts[1] !== '2') {
        errors.push('提交报告和两个压缩包时，压缩包文件名需分别以 _1 和 _2 结尾。');
      }
    } else if (validFiles.length > 0 && reports.length === 0 && dataPackages.length === 0) {
      // This case happens if all files were illegal and filtered out
    } else if (validFiles.length > 0) {
      errors.push('提交的文件组合不符合任何一种有效的提交场景。');
    }

    if (errors.length > 0) {
      setValidationResult({ success: false, errors });
    } else {
      setValidationResult({ success: true });
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const files = newFileList.map(f => f.originFileObj || f);
    validateFiles(files);
  };

  return (
    <div>
      <Dragger
        name="file"
        multiple
        beforeUpload={() => false}
        onChange={handleFileChange}
        fileList={fileList}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域进行检查</p>
      </Dragger>
      {validationResult && (
        <div style={{ marginTop: 16 }}>
          {validationResult.success ? (
            <Alert title="文件命名符合要求" type="success" showIcon />
          ) : (
            validationResult.errors.map((error, index) => (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: index === validationResult.errors.length - 1 ? 0 : 8 }}
                key={index}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SubmissionChecker;