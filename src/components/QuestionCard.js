import React from 'react';
import { Tag } from 'antd';
import Answer from './Answer';
import '../css/QuestionCard.css';

const QuestionCard = ({ children, source }) => {
  const sourceArray = Array.isArray(source) ? source : (source ? [source] : []);

  const questionContent = React.Children.toArray(children).filter(
    (child) => child.type !== Answer
  );
  const answerContent = React.Children.toArray(children).find(
    (child) => child.type === Answer
  );

  return (
    <div className="question-card">
      {sourceArray.length > 0 && (
        <div className="question-source">
          {sourceArray.map((s, index) => (
            <Tag key={index} color={s.includes('概念') ? 'green' : 'blue'}>
              {s}
            </Tag>
          ))}
        </div>
      )}
      <div className="question-content">{questionContent}</div>
      {answerContent}
    </div>
  );
};

export default QuestionCard;