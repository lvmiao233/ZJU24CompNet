import React from 'react';
import { Result } from 'antd';

// 主要的导出组件，使用BrowserOnly确保SSR安全
const PlaceHolder = (props) => (
  <Result
    status="404"
    title="这部分文档还在施工中"
    subTitle="抱歉，请稍后再来查看吧"
  />
);

export default PlaceHolder;