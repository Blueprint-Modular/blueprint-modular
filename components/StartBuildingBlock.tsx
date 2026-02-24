"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const COMMAND = "pip install blueprint-modular";

export function StartBuildingBlock() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select and copy
      const el = document.getElementById("start-building-command");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, []);

  return (
    <div
      className="rounded-xl border p-6 mb-8"
      style={{
        background: "var(--bpm-bg-primary)",
        borderColor: "var(--bpm-border)",
      }}
    >
      <h2 className="text-xl font-bold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Commencer à construire votre application
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Installez le package Python BPM, puis créez votre première app avec <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>bpm run</code>.
      </p>
      <div
        className="flex items-center gap-3 rounded-lg border px-4 py-3 font-mono text-sm"
        style={{
          background: "var(--bpm-bg-secondary)",
          borderColor: "var(--bpm-border)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <code id="start-building-command" className="flex-1 break-all">
          {COMMAND}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-2 rounded-md transition"
          style={{
            background: copied ? "var(--bpm-accent)" : "transparent",
            color: copied ? "#fff" : "var(--bpm-text-secondary)",
          }}
          title={copied ? "Copié" : "Copier"}
          aria-label={copied ? "Copié" : "Copier la commande"}
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
        Collez cette commande dans votre terminal, ou consultez la{" "}
        <Link href="/docs/getting-started" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          documentation
        </Link>{" "}
        pour un guide pas à pas.
      </p>
    </div>
  );
}
