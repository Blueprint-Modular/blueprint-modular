import React from 'react';
import './Avatar.css';

const Avatar = ({
  src,
  alt,
  initials,
  size = 'medium',
  className = '',
  ...props
}) => {
  const sizeClass = size === 'small' ? 'bpm-avatar-small' : size === 'large' ? 'bpm-avatar-large' : 'bpm-avatar-medium';
  return (
    <span
      className={`bpm-avatar ${sizeClass} ${className}`.trim()}
      role="img"
      aria-label={alt || (initials ? `Avatar ${initials}` : 'Avatar')}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || ''} className="bpm-avatar-img" />
      ) : (
        <span className="bpm-avatar-initials">{initials || '?'}</span>
      )}
    </span>
  );
};

export default Avatar;
