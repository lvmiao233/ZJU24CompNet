---
slug: review24
title: 大三上期末经验分享
description: 一篇来自学长的宝贵大三上学期期末复习经验分享。文章详细介绍了如何利用‘课程攻略共享计划’、课程群聊和CC98等资源进行高效复习，并针对‘计算机网络’课程提出了具体的学习建议和注意事项，为同学们的期末备考提供了重要参考。
authors: xbwang
---

import LinkCard from "@site/src/components/LinkCard";
import FileCard from '@site/src/components/FileCard';
import { Row, Col } from 'antd';


:::warning

以下内容仅代表本人在2023-2024学年秋冬学期对所修部分课程的个人复习经验和理解。鉴于课程内容和考试要求可能会有所调整，本经验分享仅供参考，不能保证完全适用于当前学年的考察标准。建议同学们结合课程资料、教师指导等多方信息进行综合复习。

:::

<!-- truncate -->

## 1 共同点

以下几个资源还请大家用好：

* 课程攻略共享计划：https://github.com/QSCTech/zju-icicles

  历年卷/小测题等等高价值资料

* 课程急急急群聊

  方便互相答疑交流，并且可以和其他教学班的同学交换信息

* CC98

  历年卷/回忆卷/考察内容等等信息和资源



## 计算机网络

因为我们的课程内容量比较大+闭卷，记忆量会有一点大，同学们最好还是要对课程内容充分理解，对各种协议的功能/目的了解清楚后也会更容易快速记住相应的知识点

这里整理了一些学长/同学分享的资源，希望对大家学习和复习能有一定的帮助

* 25年王道计算机网络：

  和我们的课程/题型比较接近，同学们可以做做王道的题目测试知识点掌握情况

  需要注意的是王道没有网络安全的部分，而这部分在期末考试占一定的比重，一定不要只抱着王道复习而忽略了这些内容

  我个人经验是快速刷完需要4-5天，如果感觉自己掌握不太好可能需要多留一点时间

* 咸鱼暄学长的计算机网络思维导图：https://www.yuque.com/xianyuxuan/coding/network

  很清晰地梳理了课程相关的知识点，文档中还有历次辅学的回放

* 求是潮-课程资源共享计划

  里面的100题比较有用

## 计算理论

<LinkCard title="计算理论" url="https://github.com/QSCTech/zju-icicles/tree/master/%E8%AE%A1%E7%AE%97%E7%90%86%E8%AE%BA"  icon="https://github.githubassets.com/favicons/favicon.svg">
    {"浙江大学课程攻略共享计划"}
</LinkCard>


可能是大家普遍觉得比较困难的部分，README里的Undecidabilty题目集可以结合myc老师讲的套路做做看，对题型的覆盖比较全面，刷完一遍能快速掌握基本的构造思路

课程会涉及一些构造/模拟（比如图灵机→Grammar，单带模拟多带等等），思路需要掌握，考试喜欢出这类题型

NFA/DFA等的构造/转化等题型是基本内容，尽量保证100%掌握

判断题等的题型差异不大，虽然历年卷年份久远但有参考价值，可以对照判断题理一理概念的易错点



## 操作系统

3张正反打印的A4纸Cheating Sheet，郝家辉学长/天谶学长等等很多佬都有分享，个人建议根据今年考察内容+自己理解差的地方，选取几份A4纸调整结合一下，个人感觉花1-2小时改一份自己的A4纸还是比较值得的


<Row gutter={[16, 4]} justify="space-between">
<Col xs={24} sm={24} md={12} lg={24} xl={12} xxl={12}>
<FileCard file_type={'github'} name={'郝家辉学长 分享A4'} size={'114755'} link={"https://github.com/QSCTech/zju-icicles/blob/master/操作系统/考试复习资料/郝家辉 A4.docx"} />
</Col>
<Col xs={24} sm={24} md={12} lg={24} xl={12} xxl={12}>
<FileCard file_type={'github'} name={'天谶学长 分享A4'} size={'114755'} link={"https://www.cc98.org/topic/5794803"} />
</Col>
</Row>

OS王道可以做，但意义没有计网那么大，可以看看jjm小测/作业题（课程攻略共享计划都有）

概念复习时候我主要是完整过了一遍PPT，然后看了[修佬的笔记](https://www.cc98.org/topic/5773562)梳理

<LinkCard title="修佬 操作系统笔记" url="https://note.isshikih.top/cour_note/D3QD_OperatingSystem/"  icon="https://note.isshikih.top/_assets/iro/IroPatch_Brown.ico">
    {"Isshiki修's Notebook"}
</LinkCard>

## 体系结构
Cache Coherency几个Protocol必选其一考察，Scoreboard算法/Tomasulo算法/超标量变体必选其一考察，这两部分概念以及每种算法的详细步骤必须扎扎实实全部掌握

PPT可以考虑看jxh老师班的，内容比较精炼，重要的概念可以和同学讨论下确保理解是正确的
