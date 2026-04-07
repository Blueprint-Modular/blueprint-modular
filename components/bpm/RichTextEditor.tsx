"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export type RichTextExportFormat = "html" | "markdown";

export interface RichTextEditorProps {
  defaultHtml?: string;
  value?: string;
  onChange?: (payload: { html: string; markdown: string }) => void;
  format?: RichTextExportFormat;
  minHeight?: number;
  maxHeight?: number;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

function htmlToBasicMarkdown(html: string): string {
  let s = html;
  s = s.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  s = s.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  s = s.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  s = s.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  s = s.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  s = s.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  s = s.replace(/<u[^>]*>(.*?)<\/u>/gi, "_$1_");
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/p>/gi, "\n\n");
  s = s.replace(/<\/li>/gi, "\n");
  s = s.replace(/<li[^>]*>/gi, "- ");
  s = s.replace(/<[^>]+>/g, "");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Éditeur riche contentEditable ; la barre d’outils n’appelle document.execCommand que dans des gestionnaires de clic.
 */
export function RichTextEditor({
  defaultHtml = "",
  value,
  onChange,
  format = "html",
  minHeight = 160,
  maxHeight = 360,
  readOnly = false,
  placeholder = "",
  className = "",
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(true);
  const [htmlSnap, setHtmlSnap] = useState(defaultHtml);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el || !onChange) return;
    const html = el.innerHTML;
    setHtmlSnap(html);
    onChange({ html, markdown: htmlToBasicMarkdown(html) });
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const html = value ?? defaultHtml;
    if (html && el.innerHTML !== html) el.innerHTML = html;
    setHtmlSnap(el.innerHTML);
    setEmpty(!el.textContent?.trim());
  }, [value, defaultHtml]);

  const checkEmpty = useCallback(() => {
    const el = ref.current;
    setEmpty(!el?.textContent?.trim());
  }, []);

  const run = useCallback(
    (command: string, arg?: string) => {
      if (readOnly) return;
      ref.current?.focus();
      document.execCommand(command, false, arg);
      checkEmpty();
      emit();
    },
    [readOnly, checkEmpty, emit]
  );

  const onBold = useCallback(() => run("bold"), [run]);
  const onItalic = useCallback(() => run("italic"), [run]);
  const onUnderline = useCallback(() => run("underline"), [run]);
  const onH1 = useCallback(() => run("formatBlock", "h1"), [run]);
  const onH2 = useCallback(() => run("formatBlock", "h2"), [run]);
  const onUl = useCallback(() => run("insertUnorderedList"), [run]);
  const onOl = useCallback(() => run("insertOrderedList"), [run]);
  const onLink = useCallback(() => {
    const url = typeof window !== "undefined" ? window.prompt("URL du lien", "https://") : null;
    if (url) run("createLink", url);
  }, [run]);
  const onImage = useCallback(() => {
    const url = typeof window !== "undefined" ? window.prompt("URL de l’image", "https://") : null;
    if (url) run("insertImage", url);
  }, [run]);

  const mdPreview = htmlToBasicMarkdown(htmlSnap);

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        color: "var(--bpm-text-primary)",
        overflow: "hidden",
      }}
    >
      {!readOnly ? (
        <div
          role="toolbar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            padding: 8,
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary, var(--bpm-surface))",
          }}
        >
          {(
            [
              ["B", onBold, "Gras"],
              ["I", onItalic, "Italique"],
              ["U", onUnderline, "Souligné"],
              ["H1", onH1, "Titre 1"],
              ["H2", onH2, "Titre 2"],
              ["UL", onUl, "Liste"],
              ["OL", onOl, "Liste num."],
              ["Link", onLink, "Lien"],
              ["Img", onImage, "Image"],
            ] as const
          ).map(([label, fn, title]) => (
            <button
              key={label}
              type="button"
              title={title}
              onClick={fn}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--bpm-radius-sm)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: label === "B" ? 700 : label === "I" ? 500 : 600,
                textDecoration: label === "U" ? "underline" : undefined,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div style={{ position: "relative" }}>
        {empty && !readOnly ? (
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 10,
              pointerEvents: "none",
              color: "var(--bpm-text-secondary)",
              fontSize: 14,
            }}
          >
            {placeholder}
          </div>
        ) : null}
        <div
          ref={ref}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={() => {
            if (ref.current) setHtmlSnap(ref.current.innerHTML);
            checkEmpty();
            emit();
          }}
          style={{
            minHeight,
            maxHeight,
            overflowY: "auto",
            padding: 12,
            outline: "none",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        />
      </div>
      {format === "markdown" ? (
        <pre
          style={{
            margin: 0,
            padding: 8,
            fontSize: 11,
            borderTop: "1px solid var(--bpm-border)",
            color: "var(--bpm-text-secondary)",
            maxHeight: 120,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {mdPreview}
        </pre>
      ) : null}
    </div>
  );
}
