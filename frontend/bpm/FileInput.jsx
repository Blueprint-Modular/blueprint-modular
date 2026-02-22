import React, { useRef } from 'react';
import './FileInput.css';

const FileInput = ({
  label,
  accept,
  multiple = false,
  onChange,
  disabled = false,
  placeholder = 'Choisir un fichier...',
  className = '',
  ...props
}) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const files = e.target.files;
    if (onChange) onChange(multiple ? Array.from(files || []) : files?.[0]);
  };

  return (
    <div className={`bpm-fileinput-wrap ${className}`.trim()}>
      {label && <label className="bpm-fileinput-label">{label}</label>}
      <div className="bpm-fileinput-row">
        <input
          ref={inputRef}
          type="file"
          className="bpm-fileinput"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <span className="bpm-fileinput-placeholder">{placeholder}</span>
        <button
          type="button"
          className="bpm-fileinput-trigger"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Parcourir
        </button>
      </div>
    </div>
  );
};

export default FileInput;
