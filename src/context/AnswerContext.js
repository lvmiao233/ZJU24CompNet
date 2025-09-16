import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AnswerContext = createContext({
  answers: {},
  setAnswer: () => {},
});

const AnswerProvider = ({ children }) => {
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('studentAnswers');
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
    } catch (error) {
      console.error('Failed to load answers from localStorage', error);
    }
  }, []);

  const setAnswer = useCallback((id, value) => {
    setAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers, [id]: value };
      try {
        localStorage.setItem('studentAnswers', JSON.stringify(newAnswers));
        console.log('Answers updated:', newAnswers);
      } catch (error) {
        console.error('Failed to save answers to localStorage', error);
      }
      return newAnswers;
    });
  }, []);

  return (
    <AnswerContext.Provider value={{ answers, setAnswer }}>
      {children}
    </AnswerContext.Provider>
  );
};

export default AnswerProvider;