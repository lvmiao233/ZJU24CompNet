import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { Card, Row, Col } from 'antd';
import React from "react";
import CourseWorkTable from "@site/src/components/CourseWorkTable";
import resourceData from "@site/src/compData/courseResource.js";
import FileCard from "@site/src/components/FileCard";

export default function Home() {
    // const {siteConfig} = useDocusaurusContext();
    return (<Layout
        title={`计算机网络 Computer Network`}
        description="浙江大学 24-25学年秋冬学期计算机网络课程实验网站">
        <Card style={{
                  borderRadius: 0, border: '0', paddingLeft: 8,
                  background: `linear-gradient(to bottom, rgba(19, 194, 194, 0.35) 0%, rgba(255, 255, 255, 0.3) 97%, rgba(255, 255, 255, 0.6) 100%)`,
              }}
        >
            <div style={{
                     backgroundPosition: '100% -30%', backgroundRepeat: 'no-repeat', backgroundSize: '274px auto',
                     backgroundImage: "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
                     display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                     minHeight: '100%',
                 }}
            >
                <header>
                    <div className="container" style={{paddingTop: 30, paddingBottom: 30, textAlign: 'center'}}>
                        <Heading as="h1" className="hero__title"> 计算机网络 Computer Network </Heading>
                        <p className="hero__subtitle">浙江大学 24-25学年 秋冬学期</p>
                    </div>
                </header>
            </div>
        </Card>
        <main>
            <section>
                <div className="container">
                    <div className="row">
                        <div style={{marginLeft: 48, marginRight: 48, marginTop: 48}}>
                            <h2 style={{color: '#006d75'}}>课程描述</h2>
                            本课程的主要任务是研究计算机网络相关的基本理论及专业基础知识。
                            本课程从网络体系结构的角度介绍计算机网络的组成原理，以及在数据传输、网络互连和高层协议等方面的主要概念及方法；介绍网络体系中的一些重要功能及相关协议。通过学习，使学生掌握计算机网络的基本理论及专业基础知识，熟悉网络系统（特别是TCP/IP）的体系结构、工作原理及多种网络协议，全面理解各种常见的网络技术。
                            <br/> <br/>
                            <h2 style={{color: '#006d75'}}>课程信息</h2>
                            理论课程：周二 3-5节 玉泉教4-310<br/>
                            实验教学：周二 6-8节 玉泉曹光彪西-304<br/>
                            实验实践：周二 6-8节 / 周五 6-10节 玉泉曹光彪西-302<br/>
                            课程网站：<a href="http://10.214.0.253/network/exercise/index.php">计算机网络课程网站</a>
                            <br/> <br/>
                            <h2 style={{color: '#006d75'}}>预修要求</h2>
                            具有编程基础，最好熟练掌握C语言；学习了数据结构、计算机组成、操作系统等课程；能够用高级程序设计语言进行程序设计；掌握计算机硬件工作原理，对CPU、存储器、I/O系统、中断等有全面的了解。
                            <br/> <br/>
                            <h2 style={{color: '#006d75'}}>考核形式</h2>
                            <CourseWorkTable/> <br/>
                            <h2 style={{color: '#006d75'}}>课程课件</h2>
                            <Row gutter={[16, 4]} justify="space-between">
                                {resourceData.map((item, index) => (
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                        <FileCard key={index} file_type={item.file_type} name={item.name} size={item.size} link={item.link}/>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </Layout>);
}
