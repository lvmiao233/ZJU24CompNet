/**
 * 构建时脚本：解析 MDX 生成 QuestionId 索引
 * 
 * 运行方式: node scripts/generateQuestionIndex.js
 * 
 * 输出: src/data/labQuestionIndex.json
 */

const fs = require('fs');
const path = require('path');

// MDX 文件路径
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'docs');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'labQuestionIndex.json');

/**
 * 解析 MDX 文件，提取所有 questionId 及其上下文
 */
function parseMdxFile(filePath, labId) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = {};

    // 追踪当前上下文
    let currentSection = null;
    let currentTask = null;

    // 按行解析（处理 Windows 换行符）
    const lines = content.replace(/\r\n/g, '\n').split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. 检测章节标题 (## 或 ###)
        const sectionMatch = line.match(/^(#{2,3})\s+(.+)$/);
        if (sectionMatch) {
            currentSection = sectionMatch[2].trim();
        }

        // 2. 检测 TaskCard 开始
        const taskMatch = line.match(/<TaskCard\s+number=\{(\d+)\}\s+(?:.*?)title="([^"]+)"/);
        if (taskMatch) {
            currentTask = {
                number: parseInt(taskMatch[1], 10),
                title: taskMatch[2],
                section: currentSection
            };
        }

        // 也检测多行 TaskCard (属性分布在多行)
        if (line.includes('<TaskCard') && !taskMatch) {
            // 收集接下来几行直到找到完整的 TaskCard 定义
            let taskContent = line;
            for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                taskContent += ' ' + lines[j];
                if (lines[j].includes('>')) break;
            }
            const multiLineMatch = taskContent.match(/number=\{(\d+)\}.*?title="([^"]+)"/s);
            if (multiLineMatch) {
                currentTask = {
                    number: parseInt(multiLineMatch[1], 10),
                    title: multiLineMatch[2],
                    section: currentSection
                };
            }
        }

        // 3. 检测 TaskCard 结束
        if (line.includes('</TaskCard>')) {
            currentTask = null;
        }

        // 4. 检测 ScreenshotCard
        if (line.includes('<ScreenshotCard')) {
            const screenshotInfo = extractScreenshotCard(lines, i);
            if (screenshotInfo) {
                screenshotInfo.ids.forEach(item => {
                    const info = {
                        type: item.type,
                        label: item.label || null,
                        taskNumber: currentTask?.number || null,
                        taskTitle: currentTask?.title || null,
                        sectionTitle: currentSection
                    };

                    // 补充思考题信息
                    const refInfo = identifyReflectionType(item.id, labId, currentSection);
                    if (refInfo?.isReflection) {
                        Object.assign(info, refInfo);
                    }

                    questions[item.id] = info;
                });
            }
        }

        // 5. 检测 ModernInput
        const modernInputMatches = line.matchAll(/<ModernInput\s+[^>]*questionId="([^"]+)"[^>]*\/?>/g);
        for (const match of modernInputMatches) {
            const questionId = match[0].match(/questionId="([^"]+)"/)?.[1];
            if (questionId) {
                const info = {
                    type: 'fillblank',
                    taskNumber: currentTask?.number || null,
                    taskTitle: currentTask?.title || null,
                    sectionTitle: currentSection
                };

                // 补充思考题信息
                const refInfo = identifyReflectionType(questionId, labId, currentSection);
                if (refInfo?.isReflection) {
                    Object.assign(info, refInfo);
                }

                questions[questionId] = info;
            }
        }

        // 也检测 questionId 在前面的情况
        const modernInputMatchesAlt = line.matchAll(/questionId="([^"]+)"[^>]*\/?>/g);
        for (const match of modernInputMatchesAlt) {
            // 确保是 ModernInput 组件
            if (line.includes('ModernInput') && match[1]) {
                const questionId = match[1];
                if (!questions[questionId]) {
                    const info = {
                        type: 'fillblank',
                        taskNumber: currentTask?.number || null,
                        taskTitle: currentTask?.title || null,
                        sectionTitle: currentSection
                    };

                    // 补充思考题信息
                    const refInfo = identifyReflectionType(questionId, labId, currentSection);
                    if (refInfo?.isReflection) {
                        Object.assign(info, refInfo);
                    }

                    questions[questionId] = info;
                }
            }
        }
    }

    return questions;
}

/**
 * 提取 ScreenshotCard 信息
 * 返回 { ids: [{id, type, label}] }
 */
function extractScreenshotCard(lines, startIndex) {
    // 收集完整的 ScreenshotCard 内容（可能跨多行）
    let content = '';
    let depth = 0;
    let foundStart = false;

    for (let i = startIndex; i < Math.min(startIndex + 50, lines.length); i++) {
        const line = lines[i];
        content += line + '\n';

        // 计算标签深度
        if (line.includes('<ScreenshotCard')) {
            foundStart = true;
            depth++;
        }
        if (line.includes('/>') && !line.includes('</')) {
            // 自闭合标签
            if (foundStart && depth === 1) break;
        }
        if (line.includes('</ScreenshotCard>')) {
            depth--;
            if (depth <= 0) break;
        }
        // 检测仅有标签结束部分 >
        if (foundStart && line.trim() === '>' || line.trim().endsWith('/>')) {
            break;
        }
    }

    // 提取 questionId
    const questionIdMatch = content.match(/questionId="([^"]+)"/);
    if (!questionIdMatch) return null;

    const baseId = questionIdMatch[1];
    const result = { ids: [] };

    // 提取 uploadOptions
    const uploadOptionsMatch = content.match(/uploadOptions=\{(\[[\s\S]*?\])\}/);

    if (uploadOptionsMatch) {
        try {
            // 尝试解析 uploadOptions JSON
            // 需要处理 JS 对象字面量格式 -> JSON 格式
            let optionsStr = uploadOptionsMatch[1];
            // 将单引号替换为双引号
            optionsStr = optionsStr.replace(/'/g, '"');
            // 为未加引号的键添加引号
            optionsStr = optionsStr.replace(/(\w+):/g, '"$1":');
            // 处理尾随逗号
            optionsStr = optionsStr.replace(/,\s*]/g, ']');
            optionsStr = optionsStr.replace(/,\s*}/g, '}');

            const options = JSON.parse(optionsStr);

            options.forEach(opt => {
                const fullId = `${baseId}-${opt.id}`;
                const isCommand = opt.type === 'text';

                result.ids.push({
                    id: fullId,
                    type: isCommand ? 'command' : 'screenshot',
                    label: opt.label || null
                });
            });
        } catch (e) {
            // 解析失败时，使用简单的正则提取
            const idMatches = content.matchAll(/\{\s*id:\s*['"]([^'"]+)['"]/g);
            const typeMatches = [...content.matchAll(/type:\s*['"]([^'"]+)['"]/g)];
            const labelMatches = [...content.matchAll(/label:\s*['"]([^'"]+)['"]/g)];

            let idx = 0;
            for (const idMatch of idMatches) {
                const optId = idMatch[1];
                const fullId = `${baseId}-${optId}`;
                const hasTextType = typeMatches.some(m => m[1] === 'text');

                result.ids.push({
                    id: fullId,
                    type: hasTextType ? 'command' : 'screenshot',
                    label: labelMatches[idx]?.[1] || null
                });
                idx++;
            }
        }
    } else {
        // 没有 uploadOptions，只有基础 questionId（无后缀的简单截图）
        result.ids.push({
            id: baseId,
            type: 'screenshot',
            label: null
        });
    }

    return result;
}

/**
 * 识别思考题/讨论心得类
 * 真正的思考题格式：
 * - labX-analysis-qN (如 lab1-analysis-q1)
 * - labX-question (讨论心得)
 * - labX-experience (讨论心得)
 * - labX-suggestion (讨论心得)
 * - Lab3-qN 或 Lab5-qN (独立思考题)
 */
function identifyReflectionType(id, labId, sectionTitle) {
    const idLower = id.toLowerCase();
    const labLower = labId.toLowerCase().replace(/-+$/, '');

    // 0. 优先规则：如果 Section Title 包含 "实验结果与分析"，视为思考题
    if (sectionTitle && sectionTitle.includes('实验结果与分析')) {
        // 尝试提取题号 qN
        const questionMatch = id.match(/-q(\d+)$/i) || id.match(/q(\d+)$/i);
        const questionNum = questionMatch ? parseInt(questionMatch[1], 10) : undefined;

        return {
            isReflection: true,
            reflectionType: 'question-item',
            questionNum
        };
    }

    // 1. 精确匹配 labX-analysis-qN 格式的思考题
    const analysisMatch = idLower.match(new RegExp(`^${labLower}-analysis-q(\\d+)$`));
    if (analysisMatch) {
        return { isReflection: true, reflectionType: 'analysis', questionNum: parseInt(analysisMatch[1], 10) };
    }

    // 2. 匹配讨论心得类
    if (idLower === `${labLower}-question`) return { isReflection: true, reflectionType: 'question' };
    if (idLower === `${labLower}-experience`) return { isReflection: true, reflectionType: 'experience' };
    if (idLower === `${labLower}-suggestion`) return { isReflection: true, reflectionType: 'suggestion' };

    // 3. 通用匹配 qN 格式（如果上面没覆盖到，但 ID 符合格式，也认为是）
    // 移除特定的 lab 白名单，对所有 lab 生效
    const match = id.match(new RegExp(`^${labLower}-q(\\d+)$`, 'i'));
    if (match) return { isReflection: true, reflectionType: 'question-item', questionNum: parseInt(match[1], 10) };

    return { isReflection: false };
}

/**
 * 主函数
 */
function main() {
    const index = {};

    // 遍历 Lab1-6
    for (let labNum = 1; labNum <= 6; labNum++) {
        const labId = `Lab${labNum}`;
        const labIdWithHyphen = `lab${labNum}-`;
        const labDir = path.join(DOCS_DIR, labId);

        if (!fs.existsSync(labDir)) {
            console.log(`目录不存在，跳过: ${labDir}`);
            continue;
        }

        // 查找 *_Detailed.mdx 文件
        const files = fs.readdirSync(labDir).filter(f => f.endsWith('_Detailed.mdx'));

        if (files.length === 0) {
            console.log(`未找到 MDX 文件，跳过: ${labDir}`);
            continue;
        }

        const mdxPath = path.join(labDir, files[0]);
        console.log(`正在解析: ${mdxPath}`);

        const questions = parseMdxFile(mdxPath, labIdWithHyphen);

        // 为每个问题添加反思类型识别
        Object.keys(questions).forEach(id => {
            const reflection = identifyReflectionType(id, labIdWithHyphen);
            if (reflection.isReflection) {
                questions[id].isReflection = true;
                questions[id].reflectionType = reflection.reflectionType;
                if (reflection.questionNum !== undefined) {
                    questions[id].questionNum = reflection.questionNum;
                }
            }
        });

        index[labIdWithHyphen] = {
            labId: labId,
            questions: questions
        };

        console.log(`  - 提取到 ${Object.keys(questions).length} 个问题 ID`);
    }

    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入 JSON 文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`\n索引已生成: ${OUTPUT_FILE}`);
    console.log(`共 ${Object.keys(index).length} 个实验`);
}

main();
