import { useContext, useState, useRef } from 'react';
import { Button, Modal, message, Checkbox, DatePicker, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
import AnswerInput from './AnswerInput';
import { DownloadOutlined, WarningOutlined, CheckCircleOutlined, FilePdfOutlined } from '@ant-design/icons';
import { AnswerContext } from '../context/AnswerContext';
import { getAllImages } from '../utils/db';
import labQuestionIndex from '../data/labQuestionIndex.json';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import '../css/ExportButton.css';

// 条件导入浏览器依赖的库
let JSZip = null;
let saveAs = null;
let MarkdownIt = null;
let html2pdf = null;

if (ExecutionEnvironment.canUseDOM) {
  JSZip = require('jszip');
  saveAs = require('file-saver').saveAs;
  MarkdownIt = require('markdown-it');
  html2pdf = require('html2pdf.js');
}

// 内部实现组件，包含所有浏览器API相关逻辑
const ExportButtonImpl = ({ templatePath, labName, labId, allowTeammate = false }) => {
  const { answers, setAnswer } = useContext(AnswerContext);
  const [isCheckModalVisible, setCheckModalVisible] = useState(false);
  const [missingGroups, setMissingGroups] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // PDF 预览相关状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = useRef(null);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState([]);

  const checklistItems = [
    { value: 1, label: '我会在提交到作业系统前，将Markdown格式的实验报告导出为PDF格式，并按要求命名' },
    { value: 2, label: '我会在提交到作业系统时，与要求的附件一并打包为单个压缩文件提交' }
  ];

  // 获取用户信息（全局字段）
  const userName = answers['global-name'] || '';
  const studentId = answers['global-student-id'] || '';
  const teammateKey = `${labId}teammate`;
  const teammate = answers[teammateKey] || '';

  // 日期状态（不保存，仅用于导出时替换占位符）
  const [reportDate, setReportDate] = useState(dayjs());

  // 验证必填项是否已填写
  const isUserInfoComplete = userName.trim() !== '' && studentId.trim() !== '';

  // Helper: Convert Blob to Data URL
  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 收集用户已填写的数据
  const collectUserData = async () => {
    const allImages = await getAllImages();
    const labIdUpper = labId.toUpperCase();

    const filteredImages = allImages.filter(image => image.id.toUpperCase().startsWith(labIdUpper));
    const filteredAnswers = Object.keys(answers)
      .filter(key => key.toUpperCase().startsWith(labIdUpper) || key.startsWith('global-'))
      .reduce((obj, key) => {
        obj[key] = answers[key];
        return obj;
      }, {});

    // 合并所有已填写的 key
    const filledKeys = new Set([
      ...Object.keys(filteredAnswers).filter(key => {
        const value = filteredAnswers[key];
        // 检查是否为有效填写（非空且非仅空白字符）
        return value && typeof value === 'string' && value.trim() !== '';
      }),
      ...filteredImages.map(img => img.id)
    ]);

    return { filteredImages, filteredAnswers, filledKeys };
  };

  // 检查缺失项
  const checkMissingItems = async () => {
    if (!JSZip) {
      message.error('导出功能需要在浏览器环境中使用');
      return null;
    }

    try {
      // 1. 获取模板文件
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`无法获取模板文件: ${response.statusText}`);
      }
      const templateBlob = await response.blob();
      const zip = await JSZip.loadAsync(templateBlob);

      // 2. 收集所有模板中的占位符
      const allPlaceholders = new Set();
      const promises = [];

      zip.forEach((relativePath, zipEntry) => {
        if ((zipEntry.name.endsWith('.md') || zipEntry.name.endsWith('.txt')) && !zipEntry.name.startsWith('__MACOSX/')) {
          const promise = zipEntry.async('string').then(content => {
            // 匹配 {{labId-xxx}} 格式的占位符（不包括 global- 前缀的）
            const placeholderRegex = new RegExp(`\\{\\{(${labId.replace(/-$/, '')}[^}]*)\\}\\}`, 'gi');
            const matches = content.match(placeholderRegex) || [];
            matches.forEach(match => {
              const id = match.slice(2, -2); // 去除 {{ 和 }}
              allPlaceholders.add(id);
            });
          });
          promises.push(promise);
        }
      });

      await Promise.all(promises);

      // 3. 获取用户已填写的数据
      const { filledKeys } = await collectUserData();

      // 4. 获取当前实验的索引
      const labIndex = labQuestionIndex[labId];
      const indexQuestions = labIndex?.questions || {};

      // 5. 找出缺失的占位符，先按 taskNumber 收集，再按 section 分组
      const missingByTask = new Map();  // taskNumber -> { task info, counts }
      const missingReflections = [];    // 思考题/心得类

      allPlaceholders.forEach(placeholder => {
        // 检查是否已填写（大小写不敏感比较）
        const placeholderLower = placeholder.toLowerCase();

        // 忽略日期占位符（在导出面板填写，不在 context 中）
        if (placeholderLower === `${labId.toLowerCase()}date` || placeholderLower === `${labId.toLowerCase()}-date`) {
          return;
        }
        const isFilled = Array.from(filledKeys).some(key => {
          const keyLower = key.toLowerCase();
          return keyLower === placeholderLower ||
            keyLower === placeholderLower + '-default' ||
            keyLower.startsWith(placeholderLower + '-');
        });

        if (!isFilled) {
          // 从索引中查找该 ID 的信息
          const info = indexQuestions[placeholder] ||
            indexQuestions[placeholder.toLowerCase()] ||
            Object.entries(indexQuestions).find(([k]) =>
              k.toLowerCase() === placeholderLower)?.[1];

          if (info?.isReflection) {
            // 思考题/心得类
            missingReflections.push({
              id: placeholder,
              info,
              label: getReflectionLabel(info)
            });
          } else if (info?.taskNumber) {
            // 步骤类 - 按 taskNumber 收集
            const taskKey = info.taskNumber;
            if (!missingByTask.has(taskKey)) {
              missingByTask.set(taskKey, {
                taskNumber: info.taskNumber,
                taskTitle: info.taskTitle,
                sectionTitle: info.sectionTitle || '实验步骤',
                counts: { screenshot: 0, command: 0, fillblank: 0 }
              });
            }
            const group = missingByTask.get(taskKey);
            if (info.type) {
              group.counts[info.type] = (group.counts[info.type] || 0) + 1;
            }
          } else {
            // 未知类型
            console.warn('Found unclassified missing item:', placeholder, info);

            if (!missingByTask.has(-1)) {
              missingByTask.set(-1, {
                taskNumber: null,
                taskTitle: '其他',
                sectionTitle: '其他',
                counts: { screenshot: 0, command: 0, fillblank: 0 },
                items: []
              });
            }
            const unknownGroup = missingByTask.get(-1);
            unknownGroup.counts.fillblank++;
            unknownGroup.items.push(placeholder);
          }
        }
      });

      // 6. 按 sectionTitle 分组
      const sectionMap = new Map();  // sectionTitle -> [tasks]

      Array.from(missingByTask.entries())
        .filter(([k]) => k !== -1)
        .sort(([a], [b]) => a - b)
        .forEach(([_, task]) => {
          const section = task.sectionTitle || '实验步骤';
          if (!sectionMap.has(section)) {
            sectionMap.set(section, []);
          }
          sectionMap.get(section).push(task);
        });

      // 7. 构建分组结果
      const groups = [];

      sectionMap.forEach((tasks, sectionTitle) => {
        groups.push({
          sectionTitle,
          tasks: tasks.map(t => ({
            taskNumber: t.taskNumber,
            taskTitle: t.taskTitle,
            counts: t.counts
          }))
        });
      });

      // 添加未知分组
      if (missingByTask.has(-1)) {
        const unknownTask = missingByTask.get(-1);
        console.log('Found uncategorized items (未分类项目):', unknownTask.items);
        groups.push({
          sectionTitle: '其他',
          tasks: [{
            taskNumber: null,
            taskTitle: '未分类项目',
            counts: unknownTask.counts
          }]
        });
      }

      // 拆分并添加思考题与心得分组
      if (missingReflections.length > 0) {
        // 1. 思考题组（analysis, question-item）
        const analysisItems = missingReflections.filter(item =>
          item.info.reflectionType === 'analysis' ||
          item.info.reflectionType === 'question-item'
        );

        if (analysisItems.length > 0) {
          groups.push({
            sectionTitle: '思考题',
            isReflection: true,
            reflectionType: 'analysis', // 用于显示不同图标
            items: analysisItems
          });
        }

        // 2. 讨论与心得组（question, experience, suggestion）
        const discussionItems = missingReflections.filter(item =>
          item.info.reflectionType !== 'analysis' &&
          item.info.reflectionType !== 'question-item'
        );

        if (discussionItems.length > 0) {
          groups.push({
            sectionTitle: '讨论与心得',
            isReflection: true,
            reflectionType: 'discussion', // 用于显示不同图标
            items: discussionItems
          });
        }
      }

      return { missingGroups: groups, zip };
    } catch (error) {
      console.error('检查缺失项失败:', error);
      throw error;
    }
  };

  // 获取思考题/心得的可读标签
  const getReflectionLabel = (info) => {
    const labels = {
      'analysis': '思考题',
      'question': '问题与建议',
      'experience': '实验心得',
      'suggestion': '改进建议',
      'question-item': '思考题'
    };
    const base = labels[info.reflectionType] || info.reflectionType || '未知';
    if (info.questionNum !== undefined) {
      return `${base} ${info.questionNum}`;
    }
    return base;
  };

  // Helper function to replace with proper indentation
  const replaceWithIndentation = (content, placeholder, replacement) => {
    if (typeof replacement !== 'string') {
      return content.replace(placeholder, replacement);
    }

    return content.replace(placeholder, (match, ...args) => {
      // Get the full match info
      const matchIndex = args[args.length - 2]; // Second to last argument is the index

      // Find the start of the line containing the placeholder
      const beforeMatch = content.substring(0, matchIndex);
      const lastNewlineIndex = beforeMatch.lastIndexOf('\n');
      const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;

      // Extract the indentation (spaces/tabs before the placeholder)
      const lineBeforeMatch = content.substring(lineStart, matchIndex);
      const indentMatch = lineBeforeMatch.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';

      // Split replacement into lines
      const replacementLines = replacement.split('\n');

      // Apply indentation to all lines except the first
      const indentedReplacement = replacementLines.map((line, index) => {
        if (index === 0) {
          return line; // First line keeps original position
        } else {
          return indent + line; // Subsequent lines get the same indentation
        }
      }).join('\n');

      return indentedReplacement;
    });
  };

  // Helper to get replacement key (remove -default suffix)
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
  };

  // Helper to convert data URL to blob
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // 执行实际的导出逻辑（ZIP 格式）
  const performExport = async (zip = null) => {
    if (!JSZip || !saveAs) {
      message.error('导出功能需要在浏览器环境中使用');
      return;
    }

    try {
      setIsExporting(true);
      message.loading({ content: '正在导出实验报告...', key: 'exporting' });

      // 如果没有传入 zip，重新加载模板
      if (!zip) {
        const response = await fetch(templatePath);
        if (!response.ok) {
          throw new Error(`无法获取模板文件: ${response.statusText}`);
        }
        const templateBlob = await response.blob();
        zip = await JSZip.loadAsync(templateBlob);
      }

      const imgFolder = zip.folder("img");

      // 获取用户数据
      const { filteredImages, filteredAnswers } = await collectUserData();
      const allData = { ...filteredAnswers };

      // 添加日期占位符（格式：2026年1月31日）
      const dateKey = `${labId}date`;
      if (reportDate) {
        allData[dateKey] = reportDate.format('YYYY年M月D日');
      }

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
        } catch (e) {
          console.error(`处理图片 ${image.id} 失败:`, e);
          const replacementKey = getReplacementKey(image.id);
          allData[replacementKey] = `[图片加载失败: ${image.id}]`;
        }
      }

      // Replace placeholders in markdown files
      const exportPromises = [];
      zip.forEach((relativePath, zipEntry) => {
        if ((zipEntry.name.endsWith('.md') || zipEntry.name.endsWith('.txt')) && !zipEntry.name.startsWith('__MACOSX/')) {
          const promise = zipEntry.async('string').then(content => {
            let newContent = content;
            // Replace text answers and image links (case-insensitive)
            for (const key in allData) {
              // Escape special regex characters in key
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

              // Handle {{key}} with case-insensitive matching
              const textPlaceholderRegex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'gi');
              newContent = replaceWithIndentation(newContent, textPlaceholderRegex, allData[key]);
            }
            // Replace any remaining lab-specific placeholders with "未作答" (case-insensitive)
            const unansweredPlaceholderRegex = new RegExp(`\\{\\{${labId}[^}]*\\}\\}`, 'gi');
            newContent = newContent.replace(unansweredPlaceholderRegex, '未作答');

            zip.file(zipEntry.name, newContent);
          });
          exportPromises.push(promise);
        }
      });

      await Promise.all(exportPromises);

      // Generate and download the new zip file
      const newZipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(newZipBlob, `${labName}_实验报告.zip`);

      message.success({ content: '实验报告导出成功!', key: 'exporting', duration: 2 });
      setCheckModalVisible(false);

    } catch (error) {
      console.error('导出失败:', error);
      message.error({ content: `导出失败: ${error.message}`, key: 'exporting', duration: 3 });
    } finally {
      setIsExporting(false);
    }
  };

  // 准备 PDF 预览
  const handlePreparePDFPreview = async () => {
    if (!JSZip || !MarkdownIt || !html2pdf) {
      message.error('PDF导出功能需要在浏览器环境中使用');
      return;
    }

    try {
      setIsExporting(true);
      message.loading({ content: '正在生成预览...', key: 'pdf_prep' });

      // 1. Fetch Template Zip
      const response = await fetch(templatePath);
      if (!response.ok) throw new Error(`无法获取模板文件: ${response.statusText}`);
      const templateBlob = await response.blob();
      const zip = await JSZip.loadAsync(templateBlob);

      // 2. Find the Markdown file
      let mdContent = '';
      const mdFile = Object.values(zip.files).find(
        entry => (entry.name.endsWith('.md') || entry.name.endsWith('.txt')) && !entry.name.startsWith('__MACOSX/')
      );

      if (!mdFile) throw new Error('模板中未找到Markdown文件');
      mdContent = await mdFile.async('string');

      // Determine the directory of the MD file to calculate relative paths for images
      const mdPath = mdFile.name;
      const mdDir = mdPath.includes('/') ? mdPath.substring(0, mdPath.lastIndexOf('/') + 1) : '';

      // 2.1 Extract Static Images from ZIP
      const staticImages = [];
      const imagePromises = [];

      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && !zipEntry.name.startsWith('__MACOSX/') && /\.(png|jpe?g|gif|svg)$/i.test(zipEntry.name)) {
          const promise = zipEntry.async('blob').then(async (blob) => {
            const dataUri = await blobToDataURL(blob);

            let imgRelativePath = zipEntry.name;
            if (mdDir && imgRelativePath.startsWith(mdDir)) {
              imgRelativePath = imgRelativePath.substring(mdDir.length);
            }

            staticImages.push({
              relativePath: imgRelativePath,
              dataUri: dataUri
            });
          });
          imagePromises.push(promise);
        }
      });
      await Promise.all(imagePromises);

      // 3. Prepare Data for Replacement
      const { filteredImages, filteredAnswers } = await collectUserData();
      const allData = { ...filteredAnswers };

      // 添加日期占位符（格式：2026年1月31日）
      const dateKey = `${labId}date`;
      if (reportDate) {
        allData[dateKey] = reportDate.format('YYYY年M月D日');
      }

      // Process User Images
      for (const image of filteredImages) {
        let dataUri = '';
        if (image.data instanceof Blob) {
          dataUri = await blobToDataURL(image.data);
        } else if (typeof image.data === 'string' && image.data.startsWith('data:')) {
          dataUri = image.data;
        }

        if (dataUri) {
          const replacementKey = image.id.endsWith('-default') ? image.id.slice(0, -8) : image.id;
          allData[replacementKey] = `![${replacementKey}](${dataUri})`;
        }
      }

      // 4. Replace Content
      let finalMd = mdContent;

      // 4.1 Replace Static Images using Relative Paths
      staticImages.forEach(({ relativePath, dataUri }) => {
        // Critical: Replace the specific "./" prefixed path FIRST.
        finalMd = finalMd.split('./' + relativePath).join(dataUri);
        finalMd = finalMd.split(relativePath).join(dataUri);
      });

      // 4.2 Replace User Placeholders with Indentation Handling
      for (const key in allData) {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'gi');
        finalMd = replaceWithIndentation(finalMd, regex, allData[key]);
      }

      const unansweredRegex = new RegExp(`\\{\\{${labId}[^}]*\\}\\}`, 'gi');
      finalMd = finalMd.replace(unansweredRegex, '(未作答)');

      // 5. Convert to HTML
      const md = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true
      });
      // Disable indented code blocks to prevent 4-space indent from being treated as code
      md.disable('code');

      const renderedContent = md.render(finalMd);
      setPreviewHtml(renderedContent);
      setPreviewVisible(true);
      setCheckModalVisible(false);
      message.success({ content: '预览已就绪', key: 'pdf_prep', duration: 1 });

    } catch (error) {
      console.error('Preview Error:', error);
      message.error({ content: `预览生成失败: ${error.message}`, key: 'pdf_prep', duration: 3 });
    } finally {
      setIsExporting(false);
    }
  };

  // 下载 PDF
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      setIsGeneratingPDF(true);
      message.loading({ content: '正在生成PDF文件...', key: 'pdf_gen' });

      const element = contentRef.current;

      // 生成文件名：学号_姓名_LabX实验报告.pdf
      const pdfFileName = `${studentId}_${userName}_${labName}实验报告.pdf`;

      // HTML2PDF Options
      const opt = {
        margin: 15, // mm
        filename: pdfFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 800,
          scrollY: 0,
          onclone: (doc) => {
            // Find the element that has the zoom style
            const el = doc.querySelector('#pdf-preview-root').parentElement;
            if (el) {
              el.style.zoom = '1';
              el.style.width = '800px';
              el.style.margin = '0 auto';
              el.style.boxShadow = 'none';
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      message.success({ content: '下载成功!', key: 'pdf_gen', duration: 2 });
      setPreviewVisible(false);

    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error({ content: `生成失败: ${error.message}`, key: 'pdf_gen', duration: 3 });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 点击导出按钮的处理函数
  const handleExport = async () => {
    try {
      message.loading({ content: '正在检查填写情况...', key: 'exporting' });

      const result = await checkMissingItems();
      if (!result) return;

      const { missingGroups: groups, zip } = result;

      // 无论是否有缺失，都显示模态框确认
      message.destroy('exporting');
      setMissingGroups(groups);
      setCheckedItems([]); // 重置 checkbox
      setCheckModalVisible(true);
    } catch (error) {
      console.error('导出检查失败:', error);
      message.error({ content: `检查失败: ${error.message}`, key: 'exporting', duration: 3 });
    }
  };

  // 计算总缺失数量（steps + reflection items）
  const totalMissingCount = missingGroups.reduce((sum, group) => {
    if (group.isReflection) {
      return sum + (group.items?.length || 0);
    }
    return sum + (group.tasks?.length || 0);
  }, 0);

  // 处理 Checkbox 变化
  const handleChecklistChange = (checkedValues) => {
    setCheckedItems(checkedValues);
  };

  // 判断是否可以导出
  const canExport = isUserInfoComplete && checkedItems.length === checklistItems.length;

  // PDF 预览样式
  const isolatedStyles = `
    /* Reset all styles within this container */
    #pdf-preview-root {
      all: initial;
      font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
      color: #000;
      line-height: 1.6;
      width: 100%;
      display: block;
      background: white;
      box-sizing: border-box;
    }
    
    #pdf-preview-root * {
      box-sizing: border-box;
    }

    #pdf-preview-root h1 { 
      display: block; font-size: 24px; font-weight: bold; 
      margin: 20px 0 10px; border-bottom: 2px solid #333; padding-bottom: 5px; 
      color: #000;
    }
    #pdf-preview-root h2 { 
      display: block; font-size: 18px; font-weight: bold; 
      margin: 15px 0 10px; background-color: #f0f0f0; padding: 5px 10px; 
      border-left: 5px solid #333; color: #000;
    }
    #pdf-preview-root h3 { 
      display: block; font-size: 16px; font-weight: bold; margin: 15px 0 10px; 
      color: #000;
    }
    #pdf-preview-root p { 
      display: block; margin-bottom: 10px; text-align: justify; font-size: 14px; 
      color: #000;
    }
    
    #pdf-preview-root ul, #pdf-preview-root ol { 
      display: block; margin: 10px 0 10px 20px; padding-left: 20px; 
      list-style-position: outside;
    }
    #pdf-preview-root li { 
      display: list-item; margin-bottom: 5px; color: #000; font-size: 14px;
    }
    
    #pdf-preview-root pre {
      display: block;
      background: #f5f5f5;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 10px 0;
      font-family: Consolas, monospace;
      font-size: 13px;
    }
    
    #pdf-preview-root code {
      font-family: Consolas, monospace;
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 13px;
    }

    #pdf-preview-root img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 10px auto;
    }

    #pdf-preview-root table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }
    
    #pdf-preview-root th, #pdf-preview-root td {
      border: 1px solid #333;
      padding: 8px;
      text-align: left;
    }
    
    #pdf-preview-root th {
      background-color: #eee;
      font-weight: bold;
    }
  `;

  return (
    <>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={handleExport}
        loading={isExporting}
      >
        导出实验报告
      </Button>

      <Modal
        title={
          <span className="export-check-modal-title">
            {totalMissingCount > 0 ? (
              <WarningOutlined style={{ color: 'var(--ifm-color-warning-dark, #d97706)', marginRight: 8 }} />
            ) : (
              <CheckCircleOutlined style={{ color: 'var(--ifm-color-success, #00a400)', marginRight: 8 }} />
            )}
            导出前检查
          </span>
        }
        open={isCheckModalVisible}
        onCancel={() => setCheckModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCheckModalVisible(false)}>
            取消
          </Button>,
          canExport && (
            <Button
              key="export-zip"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => performExport()}
              loading={isExporting}
            >
              导出 ZIP
            </Button>
          ),
          canExport && (
            <Button
              key="export-pdf"
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={handlePreparePDFPreview}
              loading={isExporting}
            >
              导出 PDF
            </Button>
          )
        ].filter(Boolean)}
        className="export-check-modal"
        width={700}
      >
        <div className="export-check-content">
          <p className="export-check-summary">
            {totalMissingCount > 0 ? (
              <>发现以下 <strong>{totalMissingCount}</strong> 项内容未填写：</>
            ) : (
              <span style={{ color: 'var(--ifm-color-success, #00a400)' }}>太棒了！所有内容已填写完成。</span>
            )}
          </p>


          <div className="export-check-notice">
            <CheckCircleOutlined style={{ marginRight: 6 }} />
            未填写的内容将在报告中标记为"未作答"
          </div>
          <div className="export-check-groups">
            {missingGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="export-check-group">
                <div className="export-check-group-header">
                  <span className="export-check-group-name">{group.sectionTitle}</span>
                </div>
                {group.isReflection ? (
                  // 思考题/心得：显示具体项目
                  <ul className="export-check-items">
                    {group.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="export-check-item">
                        {item.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  // 步骤类：显示序号. 标题 + Tag
                  <ul className="export-check-items">
                    {group.tasks?.map((task, taskIndex) => {
                      const tags = [
                        task.counts.screenshot > 0 && `截图×${task.counts.screenshot}`,
                        task.counts.command > 0 && `命令×${task.counts.command}`,
                        task.counts.fillblank > 0 && `填空×${task.counts.fillblank}`
                      ].filter(Boolean);

                      return (
                        <li key={taskIndex} className="export-check-item export-check-task">
                          <span className="export-check-task-title">
                            <span className="export-check-task-number">{task.taskNumber}.</span> {task.taskTitle}
                          </span>
                          {tags.length > 0 && (
                            <span className="export-check-tags">
                              {tags.map((tag, i) => (
                                <span key={i} className="export-check-tag">{tag}</span>
                              ))}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* User Info Section */}
          <div className="export-user-info-section">
            <div className="export-user-info-title">填写报告个人信息</div>
            <div className="export-user-info-row">
              <div className="export-user-info-field">
                <label>姓名</label>
                <AnswerInput questionId="global-name" size="medium" placeholder="请输入姓名" />
              </div>
              <div className="export-user-info-field">
                <label>学号</label>
                <AnswerInput questionId="global-student-id" size="medium" placeholder="请输入学号" />
              </div>
              {allowTeammate && (
                <div className="export-user-info-field">
                  <label>同组学生</label>
                  <AnswerInput questionId={teammateKey} size="medium" placeholder="如有，请填写" />
                </div>
              )}
              <div className="export-user-info-field" id="export-datepicker-container">
                <label>实验日期</label>
                <ConfigProvider locale={zhCN}>
                  <DatePicker
                    value={reportDate}
                    onChange={(date) => setReportDate(date)}
                    format="YYYY年M月D日"
                    placeholder="选择日期"
                    style={{ width: 140 }}
                    getPopupContainer={() => document.getElementById('export-datepicker-container') || document.body}
                  />
                </ConfigProvider>
              </div>
            </div>
          </div>

          {/* Checklist Area */}
          <div className="export-checklist-container no-border">
            <div className="export-checklist-title">导出确认（全部勾选后可导出）：</div>
            <Checkbox.Group
              className="export-checklist-group"
              value={checkedItems}
              onChange={handleChecklistChange}
            >
              {checklistItems.map(item => (
                <div key={item.value} className="export-checklist-item">
                  <Checkbox value={item.value}>{item.label}</Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </div>
        </div>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        title="实验报告预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            取消
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            loading={isGeneratingPDF}
          >
            下载PDF
          </Button>
        ]}
        styles={{ body: { overflowY: 'auto', overflowX: 'hidden', maxHeight: '65vh', background: '#f0f2f5', padding: '20px' } }}
      >
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div
            style={{
              background: 'white',
              padding: '40px',
              margin: '0 auto',
              width: '800px',
              minWidth: '800px',
              boxSizing: 'border-box', // Ensure padding is included in width
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zoom: 0.8 // Use zoom for better layout height handling
            }}
          >
            <style>{isolatedStyles}</style>
            <div
              id="pdf-preview-root"
              ref={contentRef}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </Modal>
    </>
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