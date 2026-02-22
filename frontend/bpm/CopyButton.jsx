import React, { useState } from 'react';
import './CopyButton.css';

const CopyButton = ({
  text,
  onCopy,
  children,
  label = 'Copier',
  copiedLabel = 'Copié',
  className = '',
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const toCopy = text ?? (typeof children === 'string' ? children : '');
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      onCopy?.(toCopy);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      onCopy?.(null, e);
    }
  };

  return (
    <button
      type="button"
      className={`bpm-copybutton ${copied ? 'bpm-copybutton-copied' : ''} ${className}`.trim()}
      onClick={handleClick}
      title={copied ? copiedLabel : label}
      {...props}
    >
      {copied ? (
        <span className="bpm-copybutton-check">✓</span>
      ) : (
        <span className="bpm-copybutton-icon" aria-hidden="true">⎘</span>
      )}
      <span className="bpm-copybutton-text">{copied ? copiedLabel : label}</span>
    </button>
  );
};

export default CopyButton;
