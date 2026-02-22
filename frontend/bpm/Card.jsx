import React from 'react';
import './Card.css';

/**
 * Carte BPM : conteneur avec titre optionnel, sous-titre, image et actions.
 * Variantes : default, elevated, outlined
 */
const Card = ({
  title,
  subtitle,
  image,
  imageAlt = '',
  children,
  actions,
  variant = 'default',
  className = '',
  ...props
}) => (
  <div
    className={`bpm-card bpm-card-${variant} ${className}`.trim()}
    {...props}
  >
    {image && (
      <div className="bpm-card-image-wrap">
        <img src={image} alt={imageAlt} className="bpm-card-image" />
      </div>
    )}
    {(title || subtitle || actions || children) && (
      <div className="bpm-card-body">
        {title && <h3 className="bpm-card-title">{title}</h3>}
        {subtitle && <p className="bpm-card-subtitle">{subtitle}</p>}
        {children && <div className="bpm-card-content">{children}</div>}
        {actions && <div className="bpm-card-actions">{actions}</div>}
      </div>
    )}
  </div>
);

export default Card;
