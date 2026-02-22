import React from 'react';
import './RadioGroup.css';

const RadioGroup = ({
  name,
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  layout = 'vertical',
  className = '',
  ...props
}) => {
  const handleChange = (optValue) => {
    if (onChange) onChange(optValue);
  };
  return (
    <div className={`bpm-radiogroup-wrap bpm-radiogroup-${layout} ${className}`.trim()} role="radiogroup" aria-label={label || name} {...props}>
      {label && <span className="bpm-radiogroup-label">{label}</span>}
      <div className="bpm-radiogroup-options">
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? (opt.label != null ? opt.label : opt.value) : opt;
          const checked = value === optValue;
          return (
            <label key={String(optValue)} className={`bpm-radiogroup-item ${disabled ? 'bpm-radiogroup-disabled' : ''}`.trim()}>
              <input
                type="radio"
                name={name}
                value={optValue}
                checked={checked}
                onChange={() => handleChange(optValue)}
                disabled={disabled}
                className="bpm-radiogroup-input"
              />
              <span className="bpm-radiogroup-option-label">{optLabel}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroup;
