import React from 'react';
import './Divider.css';

const Divider = ({
  label,
  orientation = 'horizontal',
  className = '',
  ...props
}) => (
  <div
    className={`bpm-divider bpm-divider-${orientation} ${className}`.trim()}
    role="separator"
    aria-orientation={orientation}
    {...props}
  >
    {orientation === 'horizontal' && label ? (
      <>
        <span className="bpm-divider-line" />
        <span className="bpm-divider-label">{label}</span>
        <span className="bpm-divider-line" />
      </>
    ) : (
      <span className="bpm-divider-line" />
    )}
  </div>
);

export default Divider;
