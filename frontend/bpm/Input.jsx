import React from 'react';
import './Input.css';

/**
 * Champ texte BPM.
 * Équivalent bpm.input() / st.text_input()
 */
const Input = ({
  label,
  value = '',
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  className = '',
  ...props
}) => (
  <div className={`bpm-input-wrap ${className}`.trim()}>
    {label && <label className="bpm-input-label">{label}</label>}
    <input
      type={type}
      className="bpm-input"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  </div>
);

export default Input;
