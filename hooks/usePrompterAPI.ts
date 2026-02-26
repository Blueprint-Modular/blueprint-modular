"use client";

/**
 * Hook pour consommer les endpoints SSE du module Prompteur (backend FastAPI).
 * BASE_URL : même origine en prod (Nginx proxy vers prompteur-api:8001) ou variable d'env.
 */
import { useCallback } from "react";

const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_PROMPTEUR_API_URL || "/api/prompteur")
    : "";

async function readSSEStream(
  response: Response,
  onChunk: (text: string) => void
): Promise<void> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;
      if (payload.startsWith("[ERROR]")) throw new Error(payload);
      const text = payload.replace(/\\n/g, "\n");
      onChunk(text);
    }
  }
}

export function usePrompterAPI() {
  const suggestAnswer = useCallback(
    async (
      question: string,
      slide: { id: number; title: string; script: string; notes?: string | null; kpis: string[] },
      lang: string = "fr",
      onChunk: (chunk: string) => void
    ) => {
      const response = await fetch(`${BASE_URL}/suggest-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, slide, lang }),
      });
      await readSSEStream(response, onChunk);
    },
    []
  );

  const translate = useCallback(
    async (
      text: string,
      direction: "fr_to_en" | "en_to_fr" = "fr_to_en",
      onChunk: (chunk: string) => void
    ) => {
      const response = await fetch(`${BASE_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction }),
      });
      await readSSEStream(response, onChunk);
    },
    []
  );

  const summarize = useCallback(
    async (
      presentationTitle: string,
      slides: { id: number; title: string; script: string; notes?: string | null; kpis: string[] }[],
      questionsLogged: { question: string; answer: string; slide_title: string }[] = [],
      onChunk: (chunk: string) => void
    ) => {
      const response = await fetch(`${BASE_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentation_title: presentationTitle,
          slides,
          questions_logged: questionsLogged,
        }),
      });
      await readSSEStream(response, onChunk);
    },
    []
  );

  const importPptx = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${BASE_URL}/import-pptx`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail || "Erreur import PPTX");
    }
    return response.json() as Promise<{ title: string; slide_count: number; slides: { id: number; title: string; script: string; notes?: string | null; kpis: string[] }[] }>;
  }, []);

  const checkHealth = useCallback(async () => {
    const response = await fetch(`${BASE_URL}/health`);
    return response.json() as Promise<{ status: string; anthropic_key_set: boolean }>;
  }, []);

  return { suggestAnswer, translate, summarize, importPptx, checkHealth };
}
