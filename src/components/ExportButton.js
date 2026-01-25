import React, { useContext, useState, useMemo } from 'react';
import { Button, Modal, message, Checkbox } from 'antd';
import { DownloadOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { AnswerContext } from '../context/AnswerContext';
import { getAllImages } from '../utils/db';
import labQuestionIndex from '../data/labQuestionIndex.json';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import '../css/ExportButton.css';

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
  const [isCheckModalVisible, setCheckModalVisible] = useState(false);
  const [missingGroups, setMissingGroups] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState([]);

  const checklistItems = [
    { value: 1, label: '我了解我必须完整填写我的姓名、学号、同组同学（如果有），否则将被扣除部分规范性分数' },
    { value: 2, label: '我会在提交到作业系统前，将Markdown格式的实验报告导出为PDF格式，并按要求命名' },
    { value: 3, label: '我会在提交到作业系统时，与要求的附件一并打包为单个压缩文件提交' }
  ];

  // 收集用户已填写的数据
  const collectUserData = async () => {
    const allImages = await getAllImages();
    const labIdUpper = labId.toUpperCase();

    const filteredImages = allImages.filter(image => image.id.toUpperCase().startsWith(labIdUpper));
    const filteredAnswers = Object.keys(answers)
      .filter(key => key.toUpperCase().startsWith(labIdUpper))
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
            // 匹配 {{labId-xxx}} 格式的占位符
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
                counts: { screenshot: 0, command: 0, fillblank: 0 }
              });
            }
            missingByTask.get(-1).counts.fillblank++;
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

  // 执行实际的导出逻辑
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

      // 获取用户数据
      const { filteredImages, filteredAnswers } = await collectUserData();
      const allData = { ...filteredAnswers };

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

    } catch (error) {
      console.error('导出失败:', error);
      message.error({ content: `导出失败: ${error.message}`, key: 'exporting', duration: 3 });
    } finally {
      setIsExporting(false);
    }
  };

  // 点击导出按钮的处理函数
  const handleExport = async () => {
    try {
      message.loading({ content: '正在检查填写情况...', key: 'exporting' });

      const result = await checkMissingItems();
      if (!result) return;

      const { missingGroups: groups, zip } = result;

      // 计算总缺失数（steps + reflection items）
      const totalMissing = groups.reduce((sum, g) => {
        if (g.isReflection) {
          return sum + (g.items?.length || 0);
        }
        return sum + (g.tasks?.length || 0);
      }, 0);

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

  // 确认导出
  const handleConfirmExport = async () => {
    setCheckModalVisible(false);
    await performExport();
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
          checkedItems.length === checklistItems.length ? (
            <Button
              key="export"
              type="primary"
              onClick={handleConfirmExport}
            >
              确认导出
            </Button>
          ) : null
        ]}
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

          {/* Checklist Area */}
          <div className="export-checklist-container">
            <div className="export-checklist-title">导出确认 (全部勾选后可导出)：</div>
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