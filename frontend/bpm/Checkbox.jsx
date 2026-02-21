import React from 'react';
import './Checkbox.css';

const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => (
  <label className={`bpm-checkbox-wrap ${disabled ? 'bpm-checkbox-disabled' : ''} ${className}`.trim()}>
    <input
      type="checkbox"
      className="bpm-checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      {...props}
    />
    {label && <span className="bpm-checkbox-label">{label}</span>}
  </label>
);

export default Checkbox;
