/**
 * 构建前脚本：复制 docs/ 下的 .mdx/.md 文件到 static/raw/
 * 用于提供原始 Markdown 文件的访问
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'docs');
const TARGET_DIR = path.join(__dirname, '..', 'static', 'raw');

/**
 * 递归获取目录下所有匹配扩展名的文件
 */
function getFiles(dir, extensions) {
    const files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            files.push(...getFiles(fullPath, extensions));
        } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            if (extensions.includes(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

/**
 * 清空目录
 */
function cleanDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
}

/**
 * 复制文件，保持目录结构
 */
function copyFile(sourcePath, sourceDir, targetDir) {
    const relativePath = path.relative(sourceDir, sourcePath);
    const targetPath = path.join(targetDir, relativePath);
    const targetFolder = path.dirname(targetPath);

    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    fs.copyFileSync(sourcePath, targetPath);
    return relativePath;
}

// Main
console.log('📄 Copying raw markdown files...');

cleanDir(TARGET_DIR);

const files = getFiles(SOURCE_DIR, ['.md', '.mdx']);
let count = 0;

for (const file of files) {
    copyFile(file, SOURCE_DIR, TARGET_DIR);
    count++;
}

console.log(`✅ Copied ${count} markdown files to static/raw/`);
