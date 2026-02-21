import React from 'react';
import './Caption.css';

const Caption = ({ children, className = '', ...props }) => (
  <p className={`bpm-caption ${className}`.trim()} {...props}>
    {children}
  </p>
);

export default Caption;
