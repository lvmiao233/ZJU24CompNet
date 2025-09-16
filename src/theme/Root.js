import React from 'react';
import AnswerProvider from '@site/src/context/AnswerContext';

// Default implementation, that you can customize
export default function Root({children}) {
  return <AnswerProvider>{children}</AnswerProvider>;
}