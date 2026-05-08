"use client";

import React, { useRef } from "react";

export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  onFiles?: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * @component bpm.fileUploader
 * @description Bouton de téléversement de fichiers avec filtrage par type MIME et taille maximale.
 * @example
 * bpm.fileUploader({ accept: "image/*", multiple: true, maxSizeBytes: 5000000, onFiles: handleFiles })
 *
 * @param {object} props
 * @param {string} [props.accept] - Types MIME acceptés (ex: "image/*", ".pdf"). Optionnel.
 * @param {boolean} [props.multiple=false] - Autorise la sélection multiple. Optionnel.
 * @param {number} [props.maxSizeBytes] - Taille maximale par fichier en octets. Optionnel.
 * @param {function} [props.onFiles] - Callback avec les fichiers sélectionnés. Optionnel.
 * @param {boolean} [props.disabled=false] - Désactive le bouton. Optionnel.
 * @param {string} [props.label="Choisir un fichier"] - Texte du bouton. Optionnel.
 *
 * @parent bpm.form
 * @associated bpm.filePreview, bpm.button
 */
export function FileUploader({
  accept,
  multiple = false,
  maxSizeBytes,
  onFiles,
  disabled = false,
  label = "Choisir un fichier",
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const filtered = maxSizeBytes ? files.filter((f) => f.size <= maxSizeBytes) : files;
    onFiles?.(filtered);
    e.target.value = "";
  };

  return (
    <div className="bpm-file-uploader">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="px-4 py-2 rounded-lg border text-sm font-medium"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
      >
        {label}
      </button>
    </div>
  );
}
