"use client";

import { useEffect, useState } from "react";
import { getQueueSize, sync } from "@/lib/offline";

export interface OfflineIndicatorProps {
  /** Affiche le composant même sans file (pour démo / page composants). */
  demo?: boolean;
}

export function OfflineIndicator({ demo = false }: OfflineIndicatorProps) {
  const [online, setOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (demo) return;
    setOnline(navigator.onLine);
    const updateQueue = async () => setQueueSize(await getQueueSize());
    updateQueue();

    const onOnline = async () => {
      setOnline(true);
      await updateQueue();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const interval = setInterval(updateQueue, 10_000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, [demo]);

  const handleSync = async () => {
    setSyncing(true);
    await sync();
    setQueueSize(await getQueueSize());
    setSyncing(false);
  };

  if (!demo && online && queueSize === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: "var(--bpm-radius)",
        background: online ? "var(--bpm-surface)" : "var(--bpm-warning-soft)",
        border: "1px solid",
        borderColor: online ? "var(--bpm-border)" : "var(--bpm-warning)",
        fontSize: "var(--bpm-font-size-sm)",
        color: online ? "var(--bpm-text-muted)" : "var(--bpm-warning-text)",
      }}
    >
      <span>{online ? "🔄" : "⚠️"}</span>
      <span>
        {online
          ? `${queueSize} entrée${queueSize > 1 ? "s" : ""} en attente${demo ? " (démo)" : ""}`
          : `Hors ligne — ${queueSize} entrée${queueSize > 1 ? "s" : ""} en attente`}
      </span>
      {online && queueSize > 0 && !demo && (
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: "2px 8px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
            cursor: syncing ? "not-allowed" : "pointer",
            fontSize: "var(--bpm-font-size-sm)",
          }}
        >
          {syncing ? "Sync…" : "Synchroniser"}
        </button>
      )}
    </div>
  );
}
