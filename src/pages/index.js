import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';
import { Avatar, Badge, Card, Col, Row, Typography, theme } from 'antd';


const InfoCard = ({ title, desc }) => {

  return (
    <div
      style={{
        // backgroundColor: token.colorBgContainer,
        // boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        // color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '270px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div>
          <Badge status="processing" />
        </div>
        <div
          style={{
            fontSize: '16px',
            // color: token.colorText,
            paddingLeft: 4,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          // color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginTop: 8,
          paddingLeft: 16,
        }}
      >
        {desc}
      </div>
    </div>
  );
};

const Welcome = () => {
  return (
    <Card
      style={{
        borderRadius: 8,
        background: `linear-gradient(to bottom, rgba(19, 194, 194, 0.35) 0%, rgba(255, 255, 255, 0.3) 67%, rgba(255, 255, 255, 0.6) 100%)`,
        paddingLeft: 8,
      }}
    >
      <div
        style={{
          backgroundPosition: '100% -30%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '274px auto',
          backgroundImage:
            "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
        }}
      >
        <div style={{ fontSize: '30px' }}>
          {"Hi"}
        </div>
        <p
          style={{
            fontSize: '18px',
            // color: token.colorTextSecondary,
            lineHeight: '22px',
            marginTop: 6,
            marginBottom: 32,
            width: '65%',
          }}
        >
          有什么能帮到您的？
        </p>
        <div style={{ display: 'flex', lexWrap: 'wrap', gap: 16 }}>
          {/* {indexTips.map((item, index) => ( */}
          <Link key={1} to={"/welcome"}>
            <InfoCard title={111} desc={111} />
          </Link>
        {/* ))} */}
        </div>
      </div>
    </Card>)
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <Welcome />
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
