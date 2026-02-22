import React from 'react';
import './Skeleton.css';

const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  ...props
}) => {
  const style = {};
  if (width != null) style.width = typeof width === 'number' ? width + 'px' : width;
  if (height != null) style.height = typeof height === 'number' ? height + 'px' : height;
  return (
    <span
      className={`bpm-skeleton bpm-skeleton-${variant} ${className}`.trim()}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Skeleton;
