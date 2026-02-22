import React from 'react';
import './Chip.css';

const Chip = ({
  label,
  onDelete,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
  ...props
}) => (
  <span
    className={`bpm-chip bpm-chip-${variant} ${disabled ? 'bpm-chip-disabled' : ''} ${onClick && !disabled ? 'bpm-chip-clickable' : ''} ${className}`.trim()}
    role={onDelete ? 'button' : undefined}
    onClick={disabled ? undefined : onClick}
    {...props}
  >
    <span className="bpm-chip-label">{label}</span>
    {onDelete && !disabled && (
      <button
        type="button"
        className="bpm-chip-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label="Retirer"
      >
        {'\u00D7'}
      </button>
    )}
  </span>
);

export default Chip;
