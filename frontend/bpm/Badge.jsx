import React from 'react';
import './Badge.css';

/**
 * Badge BPM (étiquette, compteur).
 * Équivalent bpm.badge() / st.badge()
 */
const Badge = ({ children, variant = 'default', className = '', ...props }) => (
  <span
    className={`bpm-badge bpm-badge-${variant} ${className}`.trim()}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
