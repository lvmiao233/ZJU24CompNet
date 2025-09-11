import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { Row, Col, Alert } from 'antd';
import React, {useEffect, useState} from "react";
import CourseWorkTable from "@site/src/components/CourseWorkTable";
import resourceData from "@site/src/data/courseResource.js";
import FileCard from "@site/src/components/FileCard";
import IconHeader from "@site/src/components/IconHeader";
import {
    AimOutlined,
    FieldTimeOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    ScheduleOutlined
} from "@ant-design/icons";
import Link from "antd/es/typography/Link";

export default function Home() {
    // const {siteConfig} = useDocusaurusContext();
    const [isMobile, setIsMobile] = useState(false);
    const [isHydrating, setIsHydrating] = useState(true);

    useEffect(() => {
        const handleResize = () => { setIsMobile(window.innerWidth < 768); };
        handleResize(); // 初始检查
        window.addEventListener('resize', handleResize); // 添加事件监听器
        return () => { window.removeEventListener('resize', handleResize); };
    }, []);

    useEffect(() => {
        setIsHydrating(false);
    }, []);

    return (<Layout
        title={`计算机网络 Computer Network`}
        description="浙江大学 25-26学年秋冬学期计算机网络课程实验网站">
        <div
            style={{background: `linear-gradient(to bottom, rgba(19, 194, 194, 0.35) 0%, rgba(255, 255, 255, 0.3) 97%, rgba(255, 255, 255, 0.6) 100%)`,}}>
            <div style={{
                backgroundPosition: '100% -30%', backgroundRepeat: 'no-repeat', backgroundSize: '274px auto',
                backgroundImage: "url('/img/index_bkgd.webp')",
                display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', minHeight: '100%',
            }}
            >
                <header>
                    <div className="container" style={{paddingTop: 60, marginBottom: 30, textAlign: 'center'}}>
                        <Heading as="h1" className="hero__title"> 计算机网络 Computer Network </Heading>
                        <p className="hero__subtitle">浙江大学 24-25学年 秋冬学期</p>
                    </div>
                </header>
            </div>
        </div>
        <div className="container">
            <div style={{margin: isMobile ? '48px 16px' : '48px 48px'}}>
                <Alert message={<>如需访问实验文档正文内容，请点击左上方Tab-实验指导 或 <Link href="/docs/intro/">点我进行跳转</Link> </>} type="info" showIcon style={{marginBottom: 8}}/>
                <IconHeader icon={<AimOutlined/>} title="课程描述" size="h2"/>
                本课程的主要任务是研究计算机网络相关的基本理论及专业基础知识。
                本课程从网络体系结构的角度介绍计算机网络的组成原理，以及在数据传输、网络互连和高层协议等方面的主要概念及方法；介绍网络体系中的一些重要功能及相关协议。通过学习，使学生掌握计算机网络的基本理论及专业基础知识，熟悉网络系统（特别是TCP/IP）的体系结构、工作原理及多种网络协议，全面理解各种常见的网络技术。
                <br/> <br/>
                <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Col md={24} lg={12}>
                        <IconHeader icon={<FieldTimeOutlined/>} title="课程信息" size="h2"/>
                        <div style={{fontSize: 16}}>
                            理论课程：周二 3-5节 玉泉教4-306<br/>
                            实验教学：周二 11-13节 玉泉曹光彪西-304<br/>
                            实验实践：周二 11-13节 玉泉曹光彪西-302<br/>
                            课程网站：<a
                            href="http://10.214.0.253/network/exercise/index.php">计算机网络课程网站</a>
                        </div>
                    </Col>
                    <Col md={24} lg={12}>
                        <IconHeader icon={<InfoCircleOutlined/>} title="预修要求" size="h2"/>
                        <div style={{fontSize: 16}}>
                            有编程基础，最好熟练掌握C语言；学习数据结构、计算机组成、操作系统等课程；能用高级程序设计语言进行程序设计；<br/>
                            掌握计算机硬件工作原理，对CPU、存储器、I/O系统、中断等有全面的了解。<br/>
                        </div>
                    </Col>
                </Row> <br/>
                <IconHeader icon={<ScheduleOutlined/>} title="考核形式" size="h2"/>
                <div style={isHydrating ? { height: '200px', overflow: 'hidden' } : { minHeight: '200px' }}>
                    <CourseWorkTable/>
                </div>
                <br/>
                <IconHeader icon={<FileTextOutlined/>} title="课程课件" size="h2"/>
                <Row gutter={[16, 4]} justify="space-between">
                    {resourceData.map((item, index) => (
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                            <FileCard key={index} file_type={item.file_type} name={item.name} size={item.size} link={item.link}/>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    </Layout>);
}
