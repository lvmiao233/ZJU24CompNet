import React, { createContext, useState, useEffect, useCallback } from 'react';
import { saveImage, getAllImages } from '../utils/db';

export const AnswerContext = createContext({
  answers: {},
  setAnswer: () => {},
  images: {},
  addImage: () => {},
  getImage: () => {},
});

const AnswerProvider = ({ children }) => {
  const [answers, setAnswers] = useState({});
  const [images, setImages] = useState({});

  useEffect(() => {
    // Load text answers from localStorage
    try {
      const savedAnswers = localStorage.getItem('studentAnswers');
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
    } catch (error) {
      console.error('Failed to load answers from localStorage', error);
    }

    // Load images from IndexedDB
    getAllImages().then(allImages => {
      if (allImages) {
        const imageMap = allImages.reduce((acc, image) => {
          acc[image.id] = image.data;
          return acc;
        }, {});
        setImages(imageMap);
      }
    }).catch(error => {
        console.error('Failed to load images from IndexedDB', error);
    });
  }, []);

  const setAnswer = useCallback((id, value) => {
    setAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers, [id]: value };
      try {
        localStorage.setItem('studentAnswers', JSON.stringify(newAnswers));
      } catch (error) {
        console.error('Failed to save answers to localStorage', error);
      }
      return newAnswers;
    });
  }, []);

  const addImage = useCallback((id, imageBlob) => {
    return saveImage(id, imageBlob).then(() => {
        setImages(prevImages => ({
            ...prevImages,
            [id]: imageBlob
        }));
        // console.log('Image saved successfully to context:', id);
    }).catch(error => {
        console.error('Failed to save image to IndexedDB', error);
        throw error; // 重新抛出错误以便调用者处理
    });
  }, []);

  const getImage = useCallback((id) => {
      const imageData = images[id];
      if (imageData) {
        return { data: imageData };
      }
      return null;
  }, [images]);

  return (
    <AnswerContext.Provider value={{ answers, setAnswer, images, addImage, getImage }}>
      {children}
    </AnswerContext.Provider>
  );
};

export default AnswerProvider;