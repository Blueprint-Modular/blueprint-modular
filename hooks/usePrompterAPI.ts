"use client";

/**
 * Hook pour consommer les endpoints SSE du module Prompteur (backend FastAPI).
 * BASE_URL : même origine en prod (Nginx proxy vers prompteur-api:8001) ou variable d'env.
 * apiKey : clé API Claude (Anthropic) optionnelle ; envoyée en header X-Anthropic-API-Key.
 */
import { useCallback } from "react";

const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_PROMPTEUR_API_URL || "/api/prompteur")
    : "";

const ANTHROPIC_HEADER = "X-Anthropic-API-Key";

function headersWithKey(apiKey: string | null, init: Record<string, string> = {}): Record<string, string> {
  const h = { ...init };
  if (apiKey?.trim()) h[ANTHROPIC_HEADER] = apiKey.trim();
  return h;
}

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

export function usePrompterAPI(apiKey: string | null = null) {
  const suggestAnswer = useCallback(
    async (
      question: string,
      slide: { id: number; title: string; script: string; notes?: string | null; kpis: string[] },
      lang: string = "fr",
      onChunk: (chunk: string) => void
    ) => {
      const response = await fetch(`${BASE_URL}/suggest-answer`, {
        method: "POST",
        headers: headersWithKey(apiKey, { "Content-Type": "application/json" }),
        body: JSON.stringify({ question, slide, lang }),
      });
      await readSSEStream(response, onChunk);
    },
    [apiKey]
  );

  const translate = useCallback(
    async (
      text: string,
      direction: "fr_to_en" | "en_to_fr" = "fr_to_en",
      onChunk: (chunk: string) => void
    ) => {
      const response = await fetch(`${BASE_URL}/translate`, {
        method: "POST",
        headers: headersWithKey(apiKey, { "Content-Type": "application/json" }),
        body: JSON.stringify({ text, direction }),
      });
      await readSSEStream(response, onChunk);
    },
    [apiKey]
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
        headers: headersWithKey(apiKey, { "Content-Type": "application/json" }),
        body: JSON.stringify({
          presentation_title: presentationTitle,
          slides,
          questions_logged: questionsLogged,
        }),
      });
      await readSSEStream(response, onChunk);
    },
    [apiKey]
  );

  const PPTX_MAX_MB = 100;
  const PPTX_MAX_BYTES = PPTX_MAX_MB * 1024 * 1024;

  const importPptx = useCallback(async (file: File) => {
    if (file.size > PPTX_MAX_BYTES) {
      throw new Error(
        `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Limite : ${PPTX_MAX_MB} Mo. Réduisez la taille du PPTX ou augmentez la limite côté serveur (Nginx client_max_body_size, backend prompteur).`
      );
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${BASE_URL}/import-pptx`, {
      method: "POST",
      headers: headersWithKey(apiKey),
      body: formData,
    });
    if (!response.ok) {
      const raw = await response.text();
      const status = response.status;
      let msg = "Erreur import PPTX";
      try {
        const err = JSON.parse(raw) as { detail?: string | { msg?: string }[]; error?: string; message?: string };
        if (typeof err.detail === "string") msg = err.detail;
        else if (Array.isArray(err.detail) && err.detail.length) msg = err.detail.map((d) => (d && typeof d === "object" && "msg" in d ? ((d as { msg?: string }).msg ?? "") : String(d ?? "")).trim()).filter(Boolean).join("; ") || msg;
        else if (typeof err.error === "string") msg = err.error;
        else if (typeof err.message === "string") msg = err.message;
      } catch {
        if (raw.length && raw.length < 200) msg = raw;
        else if (status === 502) msg = "Service prompteur indisponible (502). Vérifiez que l’API prompteur tourne sur le serveur.";
        else if (status === 500) msg = "Erreur serveur (500). Consultez les logs du service prompteur.";
        else if (status === 413)
          msg = `Fichier trop volumineux (413). Augmentez la limite côté serveur : Nginx (client_max_body_size 100m), Next.js (proxyClientMaxBodySize / bodySizeLimit), ou le backend prompteur. Taille du fichier : ${(file.size / 1024 / 1024).toFixed(1)} Mo.`;
        else msg = `Erreur import PPTX (HTTP ${status}).`;
      }
      if (msg === "Erreur import PPTX" && status !== 200) msg = `Erreur import PPTX (HTTP ${status}).`;
      throw new Error(msg);
    }
    return response.json() as Promise<{ title: string; slide_count: number; slides: { id: number; title: string; script: string; notes?: string | null; kpis: string[] }[] }>;
  }, [apiKey]);

  const checkHealth = useCallback(async () => {
    const response = await fetch(`${BASE_URL}/health`, {
      headers: headersWithKey(apiKey),
    });
    return response.json() as Promise<{ status: string; anthropic_key_set: boolean }>;
  }, [apiKey]);

  return { suggestAnswer, translate, summarize, importPptx, checkHealth };
}
