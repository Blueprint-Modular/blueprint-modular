"use client";

import { useRef, useState } from "react";

export interface DocumentAnalysisImportProps {
  /** Titre de la section (ex. "Analyse de documents") */
  title: string;
  /** Description affichée sous le titre */
  description: string;
  /** Types MIME / extensions acceptés (ex. ".pdf" ou ".pdf,.docx,.txt") */
  accept?: string;
  /** Nombre max de fichiers (défaut 10) */
  maxFiles?: number;
  /** Texte dans la zone de drop (défaut : PDF, jusqu'à 10 fichiers) */
  dropLabel?: string;
  /** Label du bouton (défaut : "Analyser les documents") */
  buttonLabel?: string;
  /** Désactivé (upload en cours) */
  disabled?: boolean;
  /** Callback avec la liste des fichiers sélectionnés */
  onAnalyze: (files: File[]) => void;
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function DocumentAnalysisImport({
  title,
  description,
  accept = ".pdf",
  maxFiles = 10,
  dropLabel = "Glissez-déposez ou cliquez pour sélectionner des fichiers PDF (jusqu'à 10 fichiers)",
  buttonLabel = "Analyser les documents",
  disabled = false,
  onAnalyze,
}: DocumentAnalysisImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validFiles = (files: FileList | null): File[] => {
    if (!files?.length) return [];
    const list = Array.from(files).slice(0, maxFiles);
    const acceptList = accept.split(",").map((x) => x.trim().toLowerCase());
    return list.filter((f) => {
      const name = (f.name || "").toLowerCase();
      return acceptList.some((ext) => ext.startsWith(".") ? name.endsWith(ext) : (f.type || "").includes(ext));
    });
  };

  const handleFiles = (files: FileList | null) => {
    const next = validFiles(files);
    setSelectedFiles(next);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0 && !disabled) {
      onAnalyze(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <>
      <div className="doc-page-header">
        <h1>{title}</h1>
        <p className="doc-description">{description}</p>
      </div>
      <div className="mt-4">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleInputChange}
          className="hidden"
          aria-hidden
        />
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
          className="rounded-xl border-2 border-dashed py-10 px-6 text-center cursor-pointer transition-colors min-w-0 max-w-full"
          style={{
            borderColor: isDragging ? "var(--bpm-accent-cyan)" : "var(--bpm-border)",
            background: isDragging ? "var(--bpm-bg-secondary)" : "var(--bpm-bg-primary)",
            color: "var(--bpm-text-secondary)",
          }}
          aria-label={dropLabel}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 opacity-60" style={{ color: "var(--bpm-text-secondary)" }}><DocIcon className="w-full h-full" /></div>
            <p className="text-sm max-w-md">{dropLabel}</p>
            <button
              type="button"
              className="doc-import-pj-button"
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              style={{ color: "var(--bpm-accent-cyan)", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", textDecoration: "underline" }}
              aria-label="Parcourir les fichiers (PJ)"
            >
              Parcourir les fichiers (PJ)
            </button>
            {selectedFiles.length > 0 && (
              <p className="text-xs" style={{ color: "var(--bpm-accent-cyan)" }}>
                {selectedFiles.length} fichier{selectedFiles.length > 1 ? "s" : ""} sélectionné{selectedFiles.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || selectedFiles.length === 0}
            className="btn-secondary px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed doc-import-analyze-button"
          >
            {disabled ? "Analyse en cours..." : buttonLabel}
          </button>
        </div>
      </div>
    </>
  );
}
