import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  title = 'Aucune donnée',
  description,
  icon,
  action,
  className = '',
  ...props
}) => (
  <div className={`bpm-emptystate ${className}`.trim()} {...props}>
    {icon && <div className="bpm-emptystate-icon">{icon}</div>}
    <h3 className="bpm-emptystate-title">{title}</h3>
    {description && <p className="bpm-emptystate-desc">{description}</p>}
    {action && <div className="bpm-emptystate-action">{action}</div>}
  </div>
);

export default EmptyState;
