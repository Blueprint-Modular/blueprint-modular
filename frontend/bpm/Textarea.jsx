import React from 'react';
import './Textarea.css';

const Textarea = ({
  label,
  value = '',
  onChange,
  placeholder = '',
  rows = 4,
  disabled = false,
  className = '',
  ...props
}) => (
  <div className={`bpm-textarea-wrap ${className}`.trim()}>
    {label && <label className="bpm-textarea-label">{label}</label>}
    <textarea
      className="bpm-textarea"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      {...props}
    />
  </div>
);

export default Textarea;
