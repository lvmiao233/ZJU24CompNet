import { Collapse } from 'antd';
import '../css/CollapsibleAnswer.css';

const CollapsibleAnswer = ({ children }) => {
  const items = [{
    key: '1',
    label: '展开解析',
    children: children,
  }];

  return (
    <Collapse items={items} ghost className="collapsible-answer" />
  );
};

export default CollapsibleAnswer;