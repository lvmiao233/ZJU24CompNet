import Layout from '@theme/Layout';
import React from "react";
import { Tabs } from 'antd';
import HeroSection from "@site/src/components/HeroSection";
import InfoCard from "@site/src/components/InfoCard";
import CourseWorkTable from "@site/src/components/CourseWorkTable";
import FileCard from "@site/src/components/FileCard";
import { getTheoryMaterials, getLabMaterials } from "@site/src/data/courseResource.js";
import "@site/src/css/homepage.css";
import {
    BookOutlined,
    ExperimentOutlined,
    FieldTimeOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    ScheduleOutlined
} from "@ant-design/icons";

// Section Header component
const SectionHeader = ({ icon, title }) => (
    <div className="section-header">
        <span className="section-header-icon">{icon}</span>
        <h2 className="section-header-title">{title}</h2>
    </div>
);

// Materials Grid component
const MaterialsGrid = ({ items }) => (
    <div className="materials-grid">
        {items.map((item, index) => (
            <FileCard key={index} file_type={item.file_type} name={item.name} size={item.size} link={item.link} />
        ))}
    </div>
);

export default function Home() {
    const theoryMaterials = getTheoryMaterials();
    const labMaterials = getLabMaterials();

    const tabItems = [
        {
            key: 'theory',
            label: (
                <span>
                    <BookOutlined style={{ marginRight: 8 }} />
                    理论课程
                </span>
            ),
            children: <MaterialsGrid items={theoryMaterials} />
        },
        {
            key: 'lab',
            label: (
                <span>
                    <ExperimentOutlined style={{ marginRight: 8 }} />
                    实验课件
                </span>
            ),
            children: <MaterialsGrid items={labMaterials} />
        }
    ];

    return (
        <Layout
            title="计算机网络 Computer Network"
            description="浙江大学 25-26学年秋冬学期计算机网络课程实验网站">

            {/* Hero Section */}
            <HeroSection />

            {/* Main Content */}
            <main className="homepage-main">
                {/* Info Cards Section */}
                <section className="info-section">
                    <InfoCard icon={<FieldTimeOutlined />} title="课程信息">
                        <div>
                            理论课程：周二 3-5节 玉泉教4-306<br />
                            实验教学：周二 11-13节 玉泉曹光彪西-304<br />
                            实验实践：周二 11-13节 玉泉曹光彪西-302<br />
                            课程网站：<a href="http://10.214.0.253/network/exercise/index.php">计算机网络课程网站</a>
                        </div>
                    </InfoCard>
                    <InfoCard icon={<InfoCircleOutlined />} title="预修要求">
                        <div>
                            有编程基础，最好熟练掌握C语言；学习数据结构、计算机组成、操作系统等课程；能用高级程序设计语言进行程序设计。<br />
                            掌握计算机硬件工作原理，对CPU、存储器、I/O系统、中断等有全面的了解。
                        </div>
                    </InfoCard>
                </section>

                {/* Schedule Section */}
                <section id="schedule" className="schedule-section">
                    <SectionHeader icon={<ScheduleOutlined />} title="考核形式" />
                    <CourseWorkTable />
                </section>

                {/* Materials Section */}
                <section className="materials-section">
                    <SectionHeader icon={<FileTextOutlined />} title="课程课件" />
                    <Tabs
                        items={tabItems}
                        defaultActiveKey="theory"
                        size="large"
                    />
                </section>
            </main>
        </Layout>
    );
}
