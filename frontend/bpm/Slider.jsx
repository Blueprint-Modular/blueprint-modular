import React from 'react';
import './Slider.css';

/**
 * Slider BPM (curseur numérique).
 * Équivalent bpm.slider() / st.slider()
 */
const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleChange = (e) => {
    const v = parseFloat(e.target.value);
    if (onChange) onChange(v);
  };

  return (
    <div className={`bpm-slider-wrap ${className}`.trim()}>
      {label && <label className="bpm-slider-label">{label}</label>}
      <div className="bpm-slider-row">
        <input
          type="range"
          className="bpm-slider"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <span className="bpm-slider-value">{value ?? min}</span>
      </div>
    </div>
  );
};

export default Slider;
