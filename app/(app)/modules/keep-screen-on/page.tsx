"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button, Spinner } from "@/components/bpm";

const DURATIONS = [
  { value: 0, label: "Éteint" },
  { value: 5, label: "5 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 h" },
  { value: -1, label: "Indéfini" },
] as const;

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function KeepScreenOnPage() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [durationChoice, setDurationChoice] = useState<number>(0); // 0 = off by default, -1 = indefinite
  const [active, setActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endAtRef = useRef<number | null>(null);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    endAtRef.current = null;
    setRemainingSeconds(null);
    setActive(false);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    setError(null);
    try {
      const sentinel = await (navigator as Navigator & { wakeLock: WakeLock }).wakeLock.request("screen");
      wakeLockRef.current = sentinel;
      sentinel.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
      setActive(true);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible d'activer le maintien de l'écran.";
      setError(msg);
      setActive(false);
      return false;
    }
  }, []);

  // When user selects a duration: 0 = off, -1 = indefinite, else start timer
  useEffect(() => {
    setError(null);
    if (durationChoice === 0) {
      releaseWakeLock();
      return;
    }
    if (durationChoice === -1) {
      // Indefinite: just request lock, no timer
      releaseWakeLock();
      requestWakeLock();
      return;
    }
    // Finite duration: release any existing, then request and start countdown
    releaseWakeLock();
    const durationSeconds = durationChoice * 60;
    requestWakeLock().then((ok) => {
      if (!ok) return;
      endAtRef.current = Date.now() + durationSeconds * 1000;
      setRemainingSeconds(durationSeconds);
      timerRef.current = setInterval(() => {
        const end = endAtRef.current;
        if (!end) return;
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        setRemainingSeconds(left);
        if (left <= 0) {
          releaseWakeLock();
        }
      }, 1000);
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationChoice, requestWakeLock, releaseWakeLock]);

  // Re-acquire wake lock when page becomes visible again (if we're in "on" mode)
  useEffect(() => {
    if (supported !== true || durationChoice === 0) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        if (durationChoice === -1) {
          requestWakeLock();
        } else if (endAtRef.current && Date.now() < endAtRef.current) {
          requestWakeLock();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [supported, durationChoice, requestWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  // Check support on mount (only on client side)
  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setSupported("wakeLock" in navigator);
    } else {
      setSupported(false);
    }
  }, []);

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/keep-screen-on" style={{ color: "var(--bpm-accent-cyan)" }}>Keep screen on</Link>
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Keep Screen On
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Gardez l&apos;écran allumé pendant une présentation, une réunion ou une lecture. Choisissez une durée ou indéfini.
        </p>
        <div className="doc-meta mt-2">
          <span className="doc-badge doc-badge-category">Module</span>
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        <div
          className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
            Durée d&apos;écran allumé
          </span>
          <Link
            href="/modules/keep-screen-on/documentation"
            className="text-sm underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Documentation
          </Link>
        </div>
        <div className="p-6">
          {supported === null && (
            <div className="flex items-center gap-3 py-4" style={{ color: "var(--bpm-text-secondary)" }}>
              <Spinner size="small" />
              <span className="text-sm">Vérification du support…</span>
            </div>
          )}

          {supported === false && (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "52ch" }}>
              Votre navigateur ou la page (HTTP au lieu de HTTPS) ne supporte pas le maintien de l&apos;écran. Utilisez un navigateur récent (Chrome, Edge, Safari) sur une page en <strong>HTTPS</strong>.
            </p>
          )}

          {supported === true && (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {DURATIONS.map((d) => (
                  <Button
                    key={d.value}
                    size="small"
                    variant={durationChoice === d.value ? "primary" : "outline"}
                    onClick={() => setDurationChoice(d.value)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>

              {error && (
                <p className="text-sm mb-4" style={{ color: "var(--bpm-status-error, #dc2626)" }}>
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3">
                <span
                  className="inline-flex w-3 h-3 rounded-full shrink-0"
                  style={{
                    background: active ? "var(--bpm-accent-mint, #22c55e)" : "var(--bpm-border)",
                  }}
                  aria-hidden
                />
                <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                  {active
                    ? remainingSeconds !== null
                      ? `Écran allumé — reste ${formatRemaining(remainingSeconds)}`
                      : "Écran allumé (indéfini)"
                    : "Écran non maintenu"}
                </span>
              </div>
              <p className="text-xs mt-3" style={{ color: "var(--bpm-text-secondary)" }}>
                L&apos;écran reste allumé tant que l&apos;onglet est visible. En mode durée, le maintien s&apos;arrête à la fin du compte à rebours.
              </p>
            </>
          )}
        </div>
      </div>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>← Modules</Link>
        <Link href="/modules/keep-screen-on/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
