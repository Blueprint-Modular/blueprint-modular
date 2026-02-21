import React from 'react';
import './Toggle.css';

const Toggle = ({
  label,
  value = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => (
  <label className={`bpm-toggle-wrap ${disabled ? 'bpm-toggle-disabled' : ''} ${className}`.trim()}>
    <input
      type="checkbox"
      className="bpm-toggle"
      role="switch"
      checked={value}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      {...props}
    />
    <span className="bpm-toggle-track" aria-hidden="true" />
    {label && <span className="bpm-toggle-label">{label}</span>}
  </label>
);

export default Toggle;
