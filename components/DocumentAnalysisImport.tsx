"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/bpm";

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
          className={`contracts-dropzone ${isDragging ? "drag-over" : ""}`}
          aria-label={dropLabel}
        >
          <svg className="drop-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="drop-title">Glissez-déposez vos fichiers ici</p>
          <p className="drop-subtitle">ou</p>
          <Button
            type="button"
            variant="primary"
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            aria-label="Parcourir les fichiers"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2" aria-hidden="true">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Parcourir les fichiers
          </Button>
          <div className="drop-formats">
            {accept.split(",").map((ext, i) => (
              <span key={i} className="format-badge">{ext.trim().replace(".", "").toUpperCase()}</span>
            ))}
          </div>
          <p className="drop-subtitle" style={{ fontSize: "12px", marginTop: "4px" }}>
            Jusqu&apos;à {maxFiles} fichiers simultanément
          </p>
          {selectedFiles.length > 0 && (
            <p className="text-xs mt-2" style={{ color: "var(--bpm-accent)" }}>
              {selectedFiles.length} fichier{selectedFiles.length > 1 ? "s" : ""} sélectionné{selectedFiles.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="mt-4">
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={disabled || selectedFiles.length === 0}
            className="doc-import-analyze-button"
            title={selectedFiles.length === 0 ? "Sélectionnez au moins un fichier pour continuer" : undefined}
          >
            {disabled ? (
              <>
                <span className="animate-spin inline-block mr-2">⟳</span>
                Analyse en cours...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2" aria-hidden="true">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                {buttonLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
