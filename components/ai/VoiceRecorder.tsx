"use client";

import { useState, useRef, useCallback } from "react";

export type VoiceRecorderState = "idle" | "recording" | "transcribing";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
  label?: string;
  disabled?: boolean;
}

export function VoiceRecorder({
  onTranscription,
  onError,
  label = "Dicter",
  disabled = false,
}: VoiceRecorderProps) {
  const [state, setState] = useState<VoiceRecorderState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
  }, [onError]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setState("transcribing");
  }, []);

  const sendForTranscription = useCallback(
    async (audioBlob: Blob, mimeType: string) => {
      try {
        const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
        const formData = new FormData();
        formData.append("audio", audioBlob, `recording${ext}`);

        const res = await fetch("/api/wiki/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = (await res.json()) as { transcription?: string; error?: string };

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

  const handleClick = () => {
    if (state === "idle") startRecording();
    else if (state === "recording") stopRecording();
  };

  const buttonLabel =
    state === "idle"
      ? `🎤 ${label}`
      : state === "recording"
        ? "⏹ Arrêter"
        : "⏳ Transcription…";

  const buttonStyle: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: state === "transcribing" || disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "background 0.2s",
    background:
      state === "recording"
        ? "var(--bpm-accent)"
        : state === "transcribing"
          ? "var(--bpm-border)"
          : "var(--bpm-accent-cyan)",
    color: state === "transcribing" ? "var(--bpm-text-secondary)" : "#fff",
    animation: state === "recording" ? "pulse 1.5s infinite" : "none",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "transcribing" || disabled}
      style={buttonStyle}
    >
      {buttonLabel}
    </button>
  );
}
