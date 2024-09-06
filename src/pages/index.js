import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import {Card} from 'antd';
import React from "react";
import CourseWorkTable from "@site/src/components/CourseWorkTable";
import CourseResourceList from "../components/CourseResourceList";

const Welcome = () => {
    const {siteConfig} = useDocusaurusContext();
    return (<Card
        style={{
            borderRadius: 0,
            background: `linear-gradient(to bottom, rgba(19, 194, 194, 0.35) 0%, rgba(255, 255, 255, 0.3) 97%, rgba(255, 255, 255, 0.6) 100%)`,
            paddingLeft: 8,
            borderBlockColor: 'rgba(255,255,255,0)',
            border: '0', // 移除边框
        }}
    >
        <div
            style={{
                backgroundPosition: '100% -30%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '274px auto',
                backgroundImage: "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
                display: 'flex', // 添加 display flex 来允许子元素更容易地居中
                justifyContent: 'center', // 水平居中子元素
                alignItems: 'center', // 垂直居中子元素
                flexDirection: 'column', // 子元素垂直堆叠
                minHeight: '100%', // 设置最小高度以适应内容
            }}
        >
            <header>
                <div className="container" style={{paddingTop: 30, paddingBottom: 30, textAlign: 'center'}}>
                    <Heading as="h1" className="hero__title">
                        计算机网络 Computer Network
                    </Heading>
                    <p className="hero__subtitle">浙江大学 24-25学年 秋冬学期</p>
                </div>
            </header>
        </div>
    </Card>)
}

export default function Home() {
    const {siteConfig} = useDocusaurusContext();
    return (<Layout
        title={`计算机网络 Computer Network`}
        description="浙江大学 24-25学年秋冬学期计算机网络课程实验网站">
        <Welcome/>
        <main>
            <section className={styles.features}>
                <div className="container">
                    <div className="row">
                        <div style={{marginLeft: 48, marginRight: 48, marginTop: 48}}>
                            <h2 style={{color: '#006d75'}}>课程描述</h2>
                            本课程的主要任务是研究计算机网络相关的基本理论及专业基础知识。
                            本课程从网络体系结构的角度介绍计算机网络的组成原理，以及在数据传输、网络互连和高层协议等方面的主要概念及方法；介绍网络体系中的一些重要功能及相关协议。通过学习，使学生掌握计算机网络的基本理论及专业基础知识，熟悉网络系统（特别是TCP/IP）的体系结构、工作原理及多种网络协议，全面理解各种常见的网络技术。
                            <br/>
                            <br/>
                            <h2 style={{color: '#006d75'}}>课程信息</h2>
                            理论课： 周二 3-5节 玉泉教4-310
                            <br/>
                            实验课： 周二 6-8节 玉泉曹光彪西-304
                            <br/>
                            课程网站：<a href="http://10.214.0.253/network/exercise/index.ph">计算机网络课程网站</a>，请注意，课程内容将不会在学在浙大发布
                            <br/>
                            <br/>
                            <h2 style={{color: '#006d75'}}>预修要求</h2>
                            具有编程基础，最好熟练掌握C语言；学习了数据结构、计算机组成、操作系统等课程；能够用高级程序设计语言进行程序设计；掌握计算机硬件工作原理，对CPU、存储器、I/O系统、中断等有全面的了解。
                            <br/>
                            <br/>
                            <h2 style={{color: '#006d75'}}>考核形式</h2>
                            <CourseWorkTable/>
                            <br/>
                            <h2 style={{color: '#006d75'}}>课程课件</h2>
                            <CourseResourceList/>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </Layout>);
}
