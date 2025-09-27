import React from 'react';
import { Result } from 'antd';

// 主要的导出组件，使用BrowserOnly确保SSR安全
const PlaceHolder = (props) => (
  <Result
    status="404"
    title="文档正在施工中"
    subTitle="抱歉，请稍后再来查看"
  />
);

export default PlaceHolder;