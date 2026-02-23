"use client";

import React from "react";

function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "ChunkLoadError" || /Loading chunk \d+ failed/.test(error.message);
  }
  return false;
}

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

export class ChunkErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      isChunkError: isChunkLoadError(error),
    };
  }

  render() {
    if (this.state.hasError && this.state.isChunkError) {
      return (
        <div
          style={{
            minHeight: "60vh",
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
            Cette page a peut-être été mise à jour. Rechargez la page pour charger la dernière version.
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
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "var(--bpm-bg-primary)",
            color: "var(--bpm-text-primary)",
          }}
        >
          <p>Une erreur s&apos;est produite.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, isChunkError: false })}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              background: "var(--bpm-border)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
