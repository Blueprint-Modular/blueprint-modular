"use client";

import { useState, useRef, useCallback } from "react";

export type VoiceRecorderState = "idle" | "recording" | "transcribing";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
  label?: string;
  disabled?: boolean;
  /** Afficher uniquement l’icône micro (pour barre de saisie compacte). */
  iconOnly?: boolean;
  /** Classe CSS pour aligner le style sur un autre bouton (ex. même fond inactif). */
  className?: string;
}

export function VoiceRecorder({
  onTranscription,
  onError,
  label = "Dicter",
  disabled = false,
  iconOnly = false,
  className,
}: VoiceRecorderProps) {
  const [state, setState] = useState<VoiceRecorderState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sendForTranscription = useCallback(
    async (audioBlob: Blob, mimeType: string) => {
      try {
        const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
        const formData = new FormData();
        formData.append("audio", audioBlob, `recording${ext}`);

        const res = await fetch("/api/wiki/transcribe", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        let data: { transcription?: string; error?: string };
        try {
          const text = await res.text();
          data = text ? (JSON.parse(text) as { transcription?: string; error?: string }) : {};
        } catch {
          data = { error: !res.ok ? `Erreur ${res.status}` : "Réponse invalide" };
        }

        if (!res.ok || data.error) {
          throw new Error(data.error ?? `Erreur ${res.status}`);
        }
        if (!data.transcription?.trim()) {
          throw new Error("Transcription vide — réessayez en parlant plus clairement.");
        }

        onTranscription(data.transcription);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Erreur transcription");
      } finally {
        setState("idle");
      }
    },
    [onTranscription, onError]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendForTranscription(audioBlob, mimeType);
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setState("recording");
    } catch {
      onError?.("Impossible d'accéder au microphone. Vérifiez les permissions du navigateur.");
    }
  }, [onError, sendForTranscription]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setState("transcribing");
  }, []);

  const handleClick = () => {
    if (state === "idle") startRecording();
    else if (state === "recording") stopRecording();
  };

  const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f" aria-hidden>
      <path d="M409.04-449.04Q380-478.08 380-520v-240q0-41.92 29.04-70.96Q438.08-860 480-860q41.92 0 70.96 29.04Q580-801.92 580-760v240q0 41.92-29.04 70.96Q521.92-420 480-420q-41.92 0-70.96-29.04ZM480-640Zm-30 510v-131.85q-99-11.31-164.5-84.92Q220-420.39 220-520h60q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h60q0 99.61-65.5 173.23Q609-273.16 510-261.85V-130h-60Zm58.5-361.5Q520-503 520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480q17 0 28.5-11.5Z" />
    </svg>
  );

  const buttonLabel =
    state === "idle"
      ? null
      : state === "recording"
        ? "Arrêter"
        : "Transcription…";
  const buttonText = iconOnly ? (state === "transcribing" ? "…" : null) : (state === "idle" ? label : buttonLabel);

  const useClassBackground = Boolean(className);
  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: iconOnly ? 0 : 6,
    padding: iconOnly ? "0.5rem" : "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: state === "transcribing" || disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "background 0.2s, color 0.2s",
    ...(useClassBackground && state !== "recording"
      ? {}
      : {
          background:
            state === "recording"
              ? "var(--bpm-accent)"
              : state === "transcribing"
                ? "var(--bpm-border)"
                : "var(--bpm-bg-secondary)",
          color:
            state === "recording"
              ? "#fff"
              : state === "transcribing"
                ? "var(--bpm-text-secondary)"
                : "var(--bpm-text-primary)",
        }),
    animation: state === "recording" ? "pulse 1.5s infinite" : "none",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "transcribing" || disabled}
      className={className}
      style={buttonStyle}
      data-recording={state === "recording" ? "true" : undefined}
      aria-label={state === "idle" ? (label || "Dicter") : state === "recording" ? "Arrêter l'enregistrement" : "Transcription en cours"}
      title={state === "idle" ? "Dicter (Whisper)" : state === "recording" ? "Arrêter" : "Transcription…"}
    >
      {(state === "idle" || state === "recording") && <MicIcon />}
      {state === "transcribing" && (iconOnly ? "…" : "Transcription…")}
      {state === "idle" && !iconOnly && label}
      {state === "recording" && !iconOnly && "Arrêter"}
    </button>
  );
}
