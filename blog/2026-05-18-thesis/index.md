---
slug: thesis
title: 本科论文格式自查建议
description: 面向浙江大学计算机科学与技术学院本科生使用LaTeX模板排版毕业论文的自检清单，并针对毕业论文格式整理过程中的常见问题解答并提供了解决方案。
authors: xbwang
---

import LinkCard from "@site/src/components/LinkCard";


:::warning

以下内容为本人结合2025年毕业论文与今年通知情况整理的相关信息，如与学校的后续要求相悖，请以学校/学院为准。

:::

<!-- truncate -->

## 关键点检查

* 学院更新了新版承诺书，请务必参考[Star0228](https://github.com/Star0228)提交的 Pull Request 中的改动进行修改（学院已明确要求必须修改该页）

  <LinkCard title="feat: [Major cs]update promise document for undergraduate thesis" url="https://github.com/TheNetAdmin/zjuthesis/pull/502">原创性声明及使用授权书模板更新</LinkCard>

* 检查自己封面信息是否正确、完整、准确：

  * 学院：计算机科学与技术学院（请写全称）
  * 专业：（请写全称）
  * 提交日期：YYYY年MM月DD日（例如2026年5月18日，填写实际提交日期即可）

* 检查封面公开/保密是否已经勾选（通常都是公开）：

  * 在`config/packages.tex`内添加`\usepackage{wasysym}`
  * 在`page/undergraduate/final/cover.tex`中，将`{\bfseries 涉密论文 $\square$ ~~ 公开论文 $\square$ \multido{}{6}{\quad}}`替换为`{\bfseries 涉密论文 $\Square$ ~~ 公开论文 $\CheckedBox$ \multido{}{6}{\quad}}`，注意第一个不勾选的`square`建议改为同一宏包的`Square`，观感会更统一

* 学院的封面格式和模板有微小差异，请对`page/undergraduate/final/cover.tex`的L75`姓名与学号 & \uline{\hfill \StudentName~\StudentID \hfill} \\`替换为:

  ```latex
              学生姓名 & \uline{\hfill \StudentName \hfill} \\
              学生学号 & \uline{\hfill \StudentID \hfill} \\
  ```

* 如果没有附录，请删除附录，不要编译出带有空白附录章节的PDF

* 编写好论文后，务必将LaTeX原稿和PDF分别交给LLM，检查文中是否出现错别字/Typo/语病，根据小样本的经验通常能检查到10个起步（

## 常见格式问题汇总

* **承诺书需要签字吗？**

  仅最终三合一需要签字，其余材料不需要签字

* **5.18提交盲审，是不是我需要删除全部身份相关信息？**

  本科毕业论文盲审采用单盲形式，盲审导师可以正常看到你的身份信息，不需要进行删除或启用盲审编译选项

* **提交盲审后，我还能修改我的论文吗？**

  由于导师/盲审导师/答辩导师都会提出意见，修改都是可行且通常需要的；最终以提交三合一存档的版本为准，学校届时会再次开放毕业论文系统供同学们更新论文

* **我的标题太长，离封面页边距太近，怎么办？**

  请在`zjuthesis.tex`内解除注释这两行，并在括号内分别填写你标题的前后2半

  ```latex
  \titletwolines{}{}
  \titleengtwolines{}{}
  ```

  注意：不要注释掉原有的`Title`和`TitleEng`，否则会影响页眉正常渲染

* **启用双行标题后，我的封面有非常大的空白，被挤成了2页**

  请对`page/undergraduate/final/cover.tex`的L42-48尝试修改为：

  ```latex
  {
      % TitleLines == 2
      \newcommand{\CoverTitle}{
          题目      &  \uline{\hfill \TitleLineOne{} \hfill} \\[-30pt]
          ~ & \uline{\hfill \TitleLineTwo{} \hfill} \\
      }
  }
  ```

  如果30pt不足或过多，请尝试其他值，直到封面渲染正常

* **`\clearpage`和`\cleardoublepage`的区别是什么？**

  `\clearpage`是另起一页，不保证新一页是奇数页还是偶数页

  `\cleardoublepage`是从**奇数**页起，确保其后新一页一定在奇数页（即便于翻阅的右手边），如果上一页是奇数页，则会通过填充1页空白页的方式确保新一页仍在奇数页

* **正文章节间如何换页？**

  正文章节间请使用`\clearpage`另起一页

* **空白页仍然显示内容与页码，如何处理？**

  请同步 [Noy 佬](https://github.com/NoyException)去年实现的真空白页 Patch：逐个将该 Commit 中的修改覆盖到你当前旧版本模板；随后在 `zjuthesis.tex` 中将 `TrueBlankPage` 改为 `true`。

  <LinkCard title="feat: add TrueBlankPage option" url="https://github.com/TheNetAdmin/zjuthesis/commit/a2c82cbc48c115b0163ba988c84aa754bc765f28">空白页不再拥有页眉页脚和页号</LinkCard>

* **启用`TrueBlankPage`后，目录页码从I开始了，如何解决？**

  请在`page/undergraduate/final/toc.tex`中，注释`\resetpagecounter{}`

* **盲审电子版要求到作者简历为止，如何删除目录中的任务书/考核表？**

  在`zjuthesis.tex`约L144-145为止，注释掉以下内容：

  ```latex
          \poststyle
          \inputpage{final}{post}
  ```

  注意：答辩时打印的一式三份仍然需要包含任务书/考核表（其中1份考核表将用于对你论文/设计的打分），届时请不要忘记解除这里的注释

* **简历需要很正式详细吗？**

  通常不需要，写清基本信息/学术成果/获奖等即可，可以考虑自然地提示你在哪个导的实验室

  如有现有PDF简历（例如保研时候的简历）可以通过以下方式直接使用，请在`3-cv.tex`内添加：

  ```latex
  \begin{center}
      % 如果因为PDF太长依然被挤到下页，可在这里使用 \vspace*{-1.5cm} 等缩小与标题的间距
      \makebox[\textwidth][c]{
          \includegraphics[page=1, width=1.1\textwidth]{YOUR_CV_HERE.pdf}
      }
  \end{center}
  ```

  