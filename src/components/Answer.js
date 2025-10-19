import React from 'react';
import { Collapse } from 'antd';
import '../css/Answer.css';

const Answer = ({ children }) => {
  const items = [{
    key: '1',
    label: '展开解析',
    children: children,
  }];

  return (
    <Collapse items={items} ghost className="answer-collapse" />
  );
};

export default Answer;