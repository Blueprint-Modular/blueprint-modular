"use client";

import React, { useEffect, useState } from "react";
import { CodeBlock } from "./CodeBlock";

export interface FilePreviewProps {
  url: string;
  filename: string;
  mimeType?: string;
  height?: string | number;
  showDownload?: boolean;
  className?: string;
  /** Props snake_case (API Python) — normalisées en interne */
  file_url?: string;
  file_name?: string;
  mime_type?: string;
  show_download?: boolean;
  class_name?: string;
}

function inferMime(filename: string | undefined): string {
  if (filename == null || typeof filename !== "string") return "application/octet-stream";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    json: "application/json",
    txt: "text/plain",
    md: "text/markdown",
    ts: "text/typescript",
    tsx: "text/tsx",
    js: "text/javascript",
    jsx: "text/jsx",
    html: "text/html",
    css: "text/css",
  };
  return map[ext] ?? "application/octet-stream";
}

export function FilePreview(props: FilePreviewProps) {
  const url = props.url ?? props.file_url ?? "";
  const filename = props.filename ?? props.file_name ?? "";
  const mimeProp = props.mimeType ?? props.mime_type;
  const height = props.height ?? 400;
  const showDownload = props.showDownload ?? props.show_download ?? true;
  const className = props.className ?? props.class_name ?? "";

  const mime = mimeProp ?? inferMime(filename);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";
  const isText =
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/javascript";

  useEffect(() => {
    setError(null);
  }, [url, filename]);

  useEffect(() => {
    if (!url || !isText || typeof fetch === "undefined") return;
    setTextContent(null);
    fetch(url)
      .then((r) => r.text())
      .then(setTextContent)
      .catch(() => setError("Impossible de charger le fichier"));
  }, [isText, url]);

  const h = typeof height === "number" ? `${height}px` : height;

  if (!url || !filename) {
    return (
      <div
        className={className ? `bpm-file-preview ${className}`.trim() : "bpm-file-preview"}
        style={{
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius-md)",
          padding: 24,
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-error)",
          fontSize: 14,
        }}
      >
        bpm.filePreview : url et filename sont requis.
      </div>
    );
  }

  if (isImage) {
    return (
      <div
        className={className ? `bpm-file-preview ${className}`.trim() : "bpm-file-preview"}
        style={{
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius-md)",
          overflow: "hidden",
          background: "var(--bpm-bg-secondary)",
        }}
      >
        <img
          src={url}
          alt={filename}
          style={{
            display: "block",
            maxWidth: "100%",
            height: h,
            objectFit: "contain",
          }}
          onError={() => setError("Impossible de charger l'image")}
        />
        {showDownload && (
          <a
            href={url}
            download={filename}
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "8px 12px",
              fontSize: 14,
              color: "var(--bpm-accent)",
            }}
          >
            Télécharger
          </a>
        )}
        {error && (
          <div style={{ padding: 16, color: "var(--bpm-error)" }}>{error}</div>
        )}
      </div>
    );
  }

  if (isPdf) {
    return (
      <div
        className={className ? `bpm-file-preview ${className}`.trim() : "bpm-file-preview"}
        style={{
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius-md)",
          overflow: "hidden",
          height: h,
          background: "var(--bpm-bg-secondary)",
        }}
      >
        <iframe
          title={filename}
          src={url}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
        {showDownload && (
          <a
            href={url}
            download={filename}
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "8px 12px",
              fontSize: 14,
              color: "var(--bpm-accent)",
            }}
          >
            Télécharger
          </a>
        )}
      </div>
    );
  }

  if (isText) {
    const lang =
      mime === "application/json"
        ? "json"
        : filename.endsWith(".md")
          ? "markdown"
          : filename.endsWith(".ts") || filename.endsWith(".tsx")
            ? "typescript"
            : "text";
    return (
      <div
        className={className ? `bpm-file-preview ${className}`.trim() : "bpm-file-preview"}
        style={{
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius-md)",
          overflow: "hidden",
        }}
      >
        {textContent != null ? (
          <CodeBlock code={textContent} language={lang} />
        ) : error ? (
          <div style={{ padding: 16, color: "var(--bpm-error)" }}>{error}</div>
        ) : (
          <div style={{ padding: 16, color: "var(--bpm-text-muted)" }}>
            Chargement...
          </div>
        )}
        {showDownload && (
          <a
            href={url}
            download={filename}
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "8px 12px",
              fontSize: 14,
              color: "var(--bpm-accent)",
            }}
          >
            Télécharger
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className={className ? `bpm-file-preview ${className}`.trim() : "bpm-file-preview"}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius-md)",
        padding: 24,
        background: "var(--bpm-bg-secondary)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, color: "var(--bpm-text-muted)", marginBottom: 8 }}>
        📄
      </div>
      <div style={{ fontSize: 14, color: "var(--bpm-text-primary)", marginBottom: 8 }}>
        {filename}
      </div>
      {showDownload && (
        <a
          href={url}
          download={filename}
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: "var(--bpm-radius-sm)",
            background: "var(--bpm-accent)",
            color: "var(--bpm-accent-contrast)",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Télécharger
        </a>
      )}
    </div>
  );
}
