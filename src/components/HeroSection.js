import React from 'react';
import '../css/homepage.css';
import NetworkAnimation from './NetworkAnimation';

const HeroSection = () => (
    <section className="hero">
        <div className="hero-background" />
        <NetworkAnimation />
        <div className="hero-content">
            <h1 className="hero-title">计算机网络 <span className="hero-title-en">Computer Network</span></h1>
            <p className="hero-tagline">浙江大学 25-26学年 秋冬学期</p>
            <div className="hero-buttons">
                <a href="/docs/intro/" className="btn-primary">
                    实验文档
                </a>
                <a href="/notes/intro/" className="btn-secondary">
                    课程解析
                </a>
            </div>
        </div>
    </section>
);

export default HeroSection;
