"use client";

import { useEffect, useState } from "react";

function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "ChunkLoadError" || /Loading chunk \d+ failed/.test(error.message);
  }
  return false;
}

export function ChunkLoadHandler() {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        event.preventDefault();
        setShowReload(true);
      }
    };
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  if (!showReload) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bpm-bg-primary)",
        color: "var(--bpm-text-primary)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: 8 }}>Mise à jour disponible</h1>
      <p style={{ color: "var(--bpm-text-secondary)", marginBottom: 16, maxWidth: 400 }}>
        Rechargez la page pour charger la dernière version.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          padding: "10px 20px",
          background: "var(--bpm-accent-cyan)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Recharger la page
      </button>
    </div>
  );
}
