import React from 'react';
import '../css/ModernInput.css';

export default function ModernInput({ size = 'medium', ...props }) {
  const sizeClassName = `modern-input-${size}`;
  return <input className={`modern-input ${sizeClassName}`} {...props} />;
}