import React, { useContext } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { AnswerContext } from '../context/AnswerContext';
import { getAllImages } from '../utils/db';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

// 条件导入浏览器依赖的库
let JSZip = null;
let saveAs = null;

if (ExecutionEnvironment.canUseDOM) {
  JSZip = require('jszip');
  saveAs = require('file-saver').saveAs;
}

// 内部实现组件，包含所有浏览器API相关逻辑
const ExportButtonImpl = ({ templatePath, labName, labId }) => {
  const { answers } = useContext(AnswerContext);

  const handleExport = async () => {
    if (!JSZip || !saveAs) {
      message.error('导出功能需要在浏览器环境中使用');
      return;
    }

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

      // Helper to generate replacement key (remove -default suffix)
      const getReplacementKey = (imageId) => {
        return imageId.endsWith('-default') 
          ? imageId.slice(0, -8) // Remove "-default" (8 characters)
          : imageId;
      };

      // Helper to process image data (Blob or data URL)
      const processImageData = (imageData) => {
        if (imageData instanceof Blob) {
          // Direct Blob - get extension from MIME type
          const mimeType = imageData.type || 'image/png';
          const fileExtension = mimeType.split('/')[1] || 'png';
          return {
            blob: imageData,
            fileExtension
          };
        } else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
          // Data URL string - convert to Blob
          const fileExtension = imageData.split(';')[0].split('/')[1] || 'png';
          const blob = dataURLtoBlob(imageData);
          return {
            blob,
            fileExtension
          };
        } else {
          // Fallback for unexpected formats
          console.warn('Unexpected image data format:', typeof imageData);
          return null;
        }
      }

      // 3. Get all data (text answers and images) and filter by labId (case-insensitive)
      const allImages = await getAllImages();
      const labIdUpper = labId.toUpperCase();
      
      const filteredImages = allImages.filter(image => image.id.toUpperCase().startsWith(labIdUpper));
      const filteredAnswers = Object.keys(answers)
        .filter(key => key.toUpperCase().startsWith(labIdUpper))
        .reduce((obj, key) => {
          obj[key] = answers[key];
          return obj;
        }, {});

      const allData = { ...filteredAnswers };

      // console.log(`导出处理：labId: ${labId} (转换为大写: ${labIdUpper})`);
      // console.log(`所有图片 (${allImages.length}):`, allImages.map(img => img.id));
      // console.log(`过滤后图片 (${filteredImages.length}):`, filteredImages.map(img => img.id));
      // console.log(`过滤后答案:`, Object.keys(filteredAnswers));
      // filteredImages.forEach(img => console.log(`图片ID: ${img.id}, 数据类型:`, typeof img.data, img.data instanceof Blob ? 'Blob' : 'Other'));

      for (const image of filteredImages) {
        try {
            const processResult = processImageData(image.data);
            
            if (!processResult) {
                console.error(`无法处理图片 ${image.id}: 不支持的数据格式`);
                const replacementKey = getReplacementKey(image.id);
                allData[replacementKey] = `[图片格式不支持: ${image.id}]`;
                continue;
            }

            const { blob, fileExtension } = processResult;
            const imageName = `${image.id}.${fileExtension}`;
            
            imgFolder.file(imageName, blob);
            
            // Generate the key for replacement - remove "-default" suffix if present
            const replacementKey = getReplacementKey(image.id);
            
            // For replacement, we create a markdown image link
            allData[replacementKey] = `![${replacementKey}](./img/${imageName})`;
            // console.log(`成功处理图片: ${image.id} -> ${imageName}, 替换key: ${replacementKey}`);
        } catch (e) {
            console.error(`处理图片 ${image.id} 失败:`, e);
            const replacementKey = getReplacementKey(image.id);
            allData[replacementKey] = `[图片加载失败: ${image.id}]`;
        }
      }

      // console.log(`最终用于替换的数据keys:`, Object.keys(allData));

      // 4. Replace placeholders in markdown files
      const promises = [];
      zip.forEach((relativePath, zipEntry) => {
        if ((zipEntry.name.endsWith('.md') || zipEntry.name.endsWith('.txt')) && !zipEntry.name.startsWith('__MACOSX/')) {
          const promise = zipEntry.async('string').then(content => {
            let newContent = content;
            // Replace text answers and image links (case-insensitive)
            for (const key in allData) {
              // Escape special regex characters in key
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              
              // Handle both {{key}} and {{image:key}} with case-insensitive matching
              const textPlaceholderRegex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'gi');
              const imagePlaceholderRegex = new RegExp(`\\{\\{image:${escapedKey}\\}\\}`, 'gi');
              
              newContent = newContent.replace(textPlaceholderRegex, allData[key]);
              newContent = newContent.replace(imagePlaceholderRegex, allData[key]);
            }
            // Replace any remaining lab-specific placeholders with "未作答" (case-insensitive)
            const unansweredPlaceholderRegex = new RegExp(`\{\{(image:)?${labId}.*?\}\}`, 'gi');
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

// SSR安全的fallback组件
const ExportButtonFallback = () => {
  return (
    <Button 
      type="primary" 
      icon={<DownloadOutlined />} 
      disabled
    >
      导出实验报告（加载中...）
    </Button>
  );
};

// 主要的导出组件，使用BrowserOnly确保SSR安全
const ExportButton = (props) => {
  return (
    <BrowserOnly fallback={<ExportButtonFallback />}>
      {() => <ExportButtonImpl {...props} />}
    </BrowserOnly>
  );
};

export default ExportButton;