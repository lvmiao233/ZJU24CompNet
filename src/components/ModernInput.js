import React, { useContext, useRef, useEffect } from 'react';
import '../css/ModernInput.css';
import { AnswerContext } from '@site/src/context/AnswerContext';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

// 条件导入CodeJar，只在浏览器环境中加载
let CodeJar = null;
if (ExecutionEnvironment.canUseDOM) {
  CodeJar = require('codejar').CodeJar;
}

// Cisco命令语法高亮函数
const highlightCiscoCommands = (editor) => {
  const code = editor.textContent;
  
  // 定义Cisco命令关键字（包括常见缩写）
  const keywords = [
    // interface及其缩写
    'interface', 'interfac', 'interfa', 'interf', 'inter', 'inte', 'int',
    // switchport及其缩写
    'switchport', 'switchpor', 'switchpo', 'switchp', 'switch', 'switc',
    // configure及其缩写
    'configure', 'configur', 'configu', 'config', 'confi', 'conf',
    // terminal及其缩写
    'terminal', 'termina', 'termin', 'termi', 'term',
    // show及其缩写
    'show', 'sho', 'sh',
    // running-config及其缩写
    'running-config', 'running-confi', 'running-conf', 'running-con', 'running-co', 'running-c', 'running', 'runnin', 'runni', 'runn', 'run',
    // startup-config及其缩写
    'startup-config', 'startup-confi', 'startup-conf', 'startup-con', 'startup-co', 'startup-c', 'startup', 'startu', 'start',
    // description及其缩写
    'description', 'descriptio', 'descripti', 'descript', 'descrip', 'descri', 'descr', 'desc',
    // address及其缩写
    'address', 'addres', 'addre', 'addr',
    // shutdown及其缩写
    'shutdown', 'shutdow', 'shutdo', 'shutd', 'shut',
    // spanning-tree及其缩写
    'spanning-tree', 'spanning-tre', 'spanning-tr', 'spanning-t', 'spanning', 'spannin', 'spanni', 'spann',
    // channel-group及其缩写
    'channel-group', 'channel-grou', 'channel-gro', 'channel-gr', 'channel-g', 'channel', 'channe', 'chann', 'chan',
    // 其他常用命令
    'vlan', 'ip', 'mode', 'access', 'trunk', 'enable', 'hostname', 'copy', 'write', 'memory', 'exit', 'end', 'no',
    'duplex', 'speed', 'portfast', 'native', 'encapsulation', 'dot1q',
    // 路由相关命令及缩写
    'router', 'route', 'rout', 'network', 'networ', 'netwo', 'netw', 'net',
    // VLAN相关命令及缩写  
    'vlan', 'switchport', 'access-list', 'access-lis', 'access-li', 'access-l',
    // 调试相关命令及缩写
    'debug', 'debu', 'deb', 'undebug', 'undebu', 'undeb'
  ];
  
  let highlightedCode = code;
  
  // 高亮关键字 - 使用更安全的替换策略
  // 先按长度降序排列关键字，确保长关键字优先匹配，避免部分匹配问题
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
  sortedKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlightedCode = highlightedCode.replace(regex, `<span style="color: #0066cc; font-weight: bold;">$&</span>`);
  });
  
  // 高亮IP地址
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  highlightedCode = highlightedCode.replace(ipRegex, '<span style="color: #009900;">$&</span>');
  
  // 高亮数字 - 避免处理HTML标签中的数字
  const numberRegex = /\b\d+\b/g;
  highlightedCode = highlightedCode.replace(numberRegex, (match, offset, string) => {
    // 检查匹配的数字是否在HTML标签内
    const beforeMatch = string.substring(0, offset);
    const afterMatch = string.substring(offset);
    
    // 查找最近的 < 和 > 符号
    const lastOpenBracket = beforeMatch.lastIndexOf('<');
    const lastCloseBracket = beforeMatch.lastIndexOf('>');
    const nextCloseBracket = afterMatch.indexOf('>');
    
    // 如果数字在未闭合的HTML标签内，则不处理
    if (lastOpenBracket > lastCloseBracket && nextCloseBracket !== -1) {
      return match;
    }
    
    // 检查是否已经在span标签内（避免重复嵌套）
    const openSpanTags = (beforeMatch.match(/<span[^>]*>/g) || []).length;
    const closeSpanTags = (beforeMatch.match(/<\/span>/g) || []).length;
    
    if (openSpanTags > closeSpanTags) {
      return match;
    }
    
    return `<span style="color: #ff6600;">${match}</span>`;
  });
  
  editor.innerHTML = highlightedCode;
};

// 内部实现组件，包含所有浏览器API相关逻辑
function ModernInputImpl({ questionId, size = 'medium', codeEditor = false, initialLines = 1, showLineNumbers = true, ...props }) {
  const { answers, setAnswer } = useContext(AnswerContext);
  const sizeClassName = `modern-input-${size}`;
  const textareaRef = useRef(null);
  const codeEditorRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const jarRef = useRef(null);
  const isInitializing = useRef(false);

  const handleChange = (e) => {
    setAnswer(questionId, e.target.value);
  };

  const value = answers[questionId] || '';

  useEffect(() => {
    if (textareaRef.current && size === 'exlarge') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, size]);

  // 计算行数的函数
  const countLines = (text) => {
    if (!text) return 1;
    const lines = text.split('\n');
    // 对于初始化时生成的纯换行符内容，返回正确的行数
    if (text.match(/^\n*$/)) {
      return lines.length;
    }
    // 对于有实际内容的文本，如果最后一行是空的且不是唯一行，则不计入总行数
    if (lines.length > 1 && lines[lines.length - 1] === '') {
      return lines.length - 1;
    }
    return lines.length;
  };

  // 更新行号显示
  const updateLineNumbers = (lineCount) => {
    if (showLineNumbers && lineNumbersRef.current) {
      const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
      lineNumbersRef.current.innerHTML = lineNumbers
        .map(num => `<div class="line-number">${num}</div>`)
        .join('');
    }
  };

  // CodeJar初始化
  useEffect(() => {
    if (codeEditor && codeEditorRef.current && !jarRef.current && CodeJar) {
      jarRef.current = CodeJar(codeEditorRef.current, highlightCiscoCommands, {
        tab: '  ', // 使用2个空格作为缩进
        spellcheck: false,
        catchTab: true,
        preserveIdent: true,
        addClosing: false
      });

      // 设置初始值：优先使用已保存的内容，否则生成initialLines行的空内容
      const initialContent = value || (initialLines > 1 ? '\n'.repeat(initialLines - 1) : '');
      
      // 标记正在初始化，避免触发保存
      isInitializing.current = true;
      jarRef.current.updateCode(initialContent);
      isInitializing.current = false;
      
      // 初始化行号
      updateLineNumbers(countLines(initialContent));

      // 监听代码变化，但不在初始化时保存
      jarRef.current.onUpdate(code => {
        if (!isInitializing.current) {
          setAnswer(questionId, code);
        }
        updateLineNumbers(countLines(code));
      });
    }

    return () => {
      if (jarRef.current) {
        jarRef.current.destroy();
        jarRef.current = null;
      }
    };
  }, [codeEditor, questionId, setAnswer, initialLines, showLineNumbers]);

  // 当外部值变化时更新CodeJar内容
  useEffect(() => {
    if (codeEditor && jarRef.current && jarRef.current.toString() !== value) {
      // 只有在value真正有内容时才更新，避免空值覆盖用户输入
      if (value) {
        isInitializing.current = true;
        jarRef.current.updateCode(value);
        isInitializing.current = false;
        updateLineNumbers(countLines(value));
      }
    }
  }, [value, codeEditor]);

  // 如果启用了代码编辑器模式
  if (codeEditor) {
    return (
      <div className="code-editor-wrapper">
        {showLineNumbers && (
          <div 
            ref={lineNumbersRef} 
            className="line-numbers"
          />
        )}
        <div
          ref={codeEditorRef}
          className={`modern-input code-editor ${sizeClassName}`}
          {...props}
        />
      </div>
    );
  }

  if (size === 'exlarge') {
    return (
      <textarea
        ref={textareaRef}
        className={`modern-input ${sizeClassName}`}
        value={value}
        onChange={handleChange}
        rows="1"
        {...props}
      />
    );
  }

  return (
    <input
      className={`modern-input ${sizeClassName}`}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}

// SSR安全的fallback组件 - 尽可能简单
const ModernInputFallback = ({ codeEditor, initialLines = 1 }) => {
  if (codeEditor) {
    return (
      <textarea
        rows={initialLines}
        placeholder="正在加载代码编辑器..."
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
        readOnly
      />
    );
  }

  return (
    <input
      type="text"
      placeholder="正在加载..."
      style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
      readOnly
    />
  );
};

// 主要的导出组件，使用BrowserOnly确保SSR安全
export default function ModernInput(props) {
  return (
    <BrowserOnly fallback={<ModernInputFallback {...props} />}>
      {() => <ModernInputImpl {...props} />}
    </BrowserOnly>
  );
}