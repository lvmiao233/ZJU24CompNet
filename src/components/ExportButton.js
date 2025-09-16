import React, { useContext } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AnswerContext } from '../context/AnswerContext';
import { getAllImages } from '../utils/db';

const ExportButton = ({ templatePath, labName, labId }) => {
  const { answers } = useContext(AnswerContext);

  const handleExport = async () => {
    try {
      message.loading({ content: '正在导出实验报告...', key: 'exporting' });

      // 1. Fetch the template zip file
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`无法获取模板文件: ${response.statusText}`);
      }
      const templateBlob = await response.blob();

      // 2. Load the zip file and create an img folder
      const zip = await JSZip.loadAsync(templateBlob);
      const imgFolder = zip.folder("img");

      // Helper to convert data URL to blob
      const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
      }

      // 3. Get all data (text answers and images) and filter by labId
      const allImages = await getAllImages();
      
      const filteredImages = allImages.filter(image => image.id.startsWith(labId));
      const filteredAnswers = Object.keys(answers)
        .filter(key => key.startsWith(labId))
        .reduce((obj, key) => {
          obj[key] = answers[key];
          return obj;
        }, {});

      const allData = { ...filteredAnswers };

      for (const image of filteredImages) {
        try {
            const imageBlob = dataURLtoBlob(image.data);
            const fileExtension = image.data.split(';')[0].split('/')[1] || 'png';
            const imageName = `${image.id}.${fileExtension}`;
            
            imgFolder.file(imageName, imageBlob);
            
            // For replacement, we create a markdown image link
            allData[image.id] = `![${image.id}](./img/${imageName})`;
        } catch (e) {
            console.error(`处理图片 ${image.id} 失败:`, e);
            allData[image.id] = `[图片加载失败: ${image.id}]`;
        }
      }

      // 4. Replace placeholders in markdown files
      const promises = [];
      zip.forEach((relativePath, zipEntry) => {
        if ((zipEntry.name.endsWith('.md') || zipEntry.name.endsWith('.txt')) && !zipEntry.name.startsWith('__MACOSX/')) {
          const promise = zipEntry.async('string').then(content => {
            let newContent = content;
            // Replace text answers and image links
            for (const key in allData) {
              // Handle both {{key}} and {{image:key}}
              const textPlaceholder = `{{${key}}}`;
              const imagePlaceholder = `{{image:${key}}}`;
              newContent = newContent.replace(new RegExp(textPlaceholder, 'g'), allData[key]);
              newContent = newContent.replace(new RegExp(imagePlaceholder, 'g'), allData[key]);
            }
            // Replace any remaining lab-specific placeholders with "未作答"
            const unansweredPlaceholderRegex = new RegExp(`\{\{(image:)?${labId}.*?\}\}`, 'g');
            newContent = newContent.replace(unansweredPlaceholderRegex, '未作答');
            
            zip.file(zipEntry.name, newContent);
          });
          promises.push(promise);
        }
      });

      await Promise.all(promises);

      // 5. Generate and download the new zip file
      const newZipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(newZipBlob, `${labName}_实验报告.zip`);

      message.success({ content: '实验报告导出成功!', key: 'exporting', duration: 2 });

    } catch (error) {
      console.error('导出失败:', error);
      message.error({ content: `导出失败: ${error.message}`, key: 'exporting', duration: 3 });
    }
  };

  return (
    <Button 
      type="primary" 
      icon={<DownloadOutlined />} 
      onClick={handleExport}
    >
      导出实验报告
    </Button>
  );
};

export default ExportButton;