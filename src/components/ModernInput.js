import React, { useContext, useRef, useEffect } from 'react';
import '../css/ModernInput.css';
import { AnswerContext } from '@site/src/context/AnswerContext';

export default function ModernInput({ questionId, size = 'medium', ...props }) {
  const { answers, setAnswer } = useContext(AnswerContext);
  const sizeClassName = `modern-input-${size}`;
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setAnswer(questionId, e.target.value);
  };

  const value = answers[questionId] || '';

  useEffect(() => {
    if (textareaRef.current && size === 'exlarge') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, size]);

  if (size === 'exlarge') {
    return (
      <textarea
        ref={textareaRef}
        className={`modern-input ${sizeClassName}`}
        value={value}
        onChange={handleChange}
        rows="1"
        {...props}
      />
    );
  }

  return (
    <input
      className={`modern-input ${sizeClassName}`}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}