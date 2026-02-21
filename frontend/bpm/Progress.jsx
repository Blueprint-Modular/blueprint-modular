import React from 'react';
import './Progress.css';

/**
 * Barre de progression BPM.
 * Équivalent bpm.progress() / st.progress()
 */
const Progress = ({
  value = 0,
  max = 1,
  label,
  showValue = true,
  className = '',
  ...props
}) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`bpm-progress-wrap ${className}`.trim()} {...props}>
      {(label || showValue) && (
        <div className="bpm-progress-header">
          {label && <span className="bpm-progress-label">{label}</span>}
          {showValue && <span className="bpm-progress-value">{Math.round(pct)} %</span>}
        </div>
      )}
      <div className="bpm-progress-track">
        <div className="bpm-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default Progress;
