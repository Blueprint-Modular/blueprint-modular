/**
 * Client HTTP vers Ollama (zéro dépendance OpenAI).
 * Utilisé côté serveur (API routes Next.js uniquement).
 * En dev avec AI_MOCK=true, retourne des réponses mockées réalistes.
 * Si Ollama est injoignable, fallback automatique en mode démo (sans erreur côté utilisateur).
 */

import { AI_CONFIG } from "./config";

/** Activer le mock quand le health check échoue (Ollama injoignable). */
let useMockFallback = false;

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export interface VLLMChatOptions {
  timeout?: number;
  max_tokens?: number;
  /** Override du modèle Ollama (ex. qwen3:8b, mistral:7b). */
  model?: string;
}

export interface VLLMHealthResult {
  available: boolean;
  model?: string;
  latencyMs?: number;
  error?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Réponse mockée pour le développement sans serveur Ollama */
function mockChatResponse(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content ?? "";
  if (question.includes("module") || question.includes("disponible")) {
    return `Voici les modules actuellement disponibles dans l'application : **Wiki** (documentation interne), **Documents** (contrats et analyses), **IA** (assistant conversationnel). Vous pouvez poser des questions sur les données de ces modules en les sélectionnant dans le panneau de contexte.`;
  }
  if (question.includes("contrat") || question.includes("contract")) {
    return `En mode mock, les données de contrats ne sont pas chargées. En production, l'assistant a accès aux métadonnées des contrats (fournisseur, dates, engagements, niveau de risque) pour répondre à vos questions.`;
  }
  // Extraction de documents (Analyse de documents) : retourner un JSON valide pour que l'UI affiche des données en mode démo
  if (
    question.includes('"supplier"') &&
    question.includes('"client"') &&
    (question.includes("Document") || question.includes("extrait texte"))
  ) {
    return JSON.stringify({
      supplier: "Fournisseur exemple (mode démo)",
      client: "Client exemple (mode démo)",
      contract_date: "2025-01-15",
      signature_date: "2025-01-20",
      termination_date: "2026-01-19",
      summary: "Contrat type en mode démo. Configurez Ollama ou ANTHROPIC_API_KEY pour une analyse réelle.",
      key_points: ["Point clé 1 (démo)", "Point clé 2 (démo)"],
      commitments: ["Engagement exemple (démo)"],
    });
  }
  // Base contractuelle (analyse de contrat) : retourner un JSON valide pour éviter l'erreur 500 en mode démo
  if (
    question.includes("supplier_name") &&
    question.includes("executive_summary") &&
    (question.includes("Contrat à analyser") || question.includes("overall_risk_level"))
  ) {
    return JSON.stringify({
      supplier_name: "Fournisseur exemple (mode démo)",
      buyer_name: "Client exemple (mode démo)",
      contract_date: "2025-01-15",
      end_date: "2026-01-14",
      executive_summary: "Contrat type en mode démo. Configurez Ollama pour une analyse réelle.",
      key_risks: ["Risque exemple (démo)"],
      key_opportunities: ["Opportunité exemple (démo)"],
      overall_risk_level: "medium",
      commitments: [],
      signatories: [],
    });
  }
  return `Réponse mockée (AI_MOCK=true). Vous avez demandé : « ${question.slice(0, 80)}${question.length > 80 ? "…" : ""} ». Configurez AI_MOCK=false et pointez AI_SERVER_URL vers Ollama pour des réponses réelles.`;
}

export class VLLMClient {
  private baseUrl: string;
  private mock: boolean;
  private timeout: number;
  private maxRetries: number;

  constructor(options?: {
    baseUrl?: string;
    mock?: boolean;
    timeout?: number;
    maxRetries?: number;
  }) {
    this.baseUrl = options?.baseUrl ?? AI_CONFIG.baseUrl.replace(/\/$/, "");
    this.mock = options?.mock ?? AI_CONFIG.mock;
    this.timeout = options?.timeout ?? AI_CONFIG.timeout;
    this.maxRetries = options?.maxRetries ?? AI_CONFIG.maxRetries;
  }

  /**
   * POST /api/chat — chat Ollama sans streaming.
   * Retry x2 en cas d'erreur réseau.
   */
  async chat(
    messages: ChatMessage[],
    opts: VLLMChatOptions = {}
  ): Promise<{ content: string }> {
    const timeout = opts.timeout ?? this.timeout;

    if (this.mock || useMockFallback) {
      await sleep(1200);
      return { content: mockChatResponse(messages) };
    }

    // Format Ollama : /api/chat
    const url = `${this.baseUrl}/api/chat`;
    const body = {
      model: AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(id);

        if (!res.ok) {
          const text = await res.text();
          if (res.status === 404) {
            console.warn(`[vllm-client] Modèle introuvable dans Ollama (404): ${text.slice(0, 200)}`);
          }
          throw new Error(`Ollama ${res.status}: ${text.slice(0, 200)}`);
        }

        // Format réponse Ollama : { message: { role, content }, done: true }
        const data = (await res.json()) as {
          message?: { content?: string };
          done?: boolean;
        };
        const content = data.message?.content ?? "";
        return { content };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) await sleep(1000 * (attempt + 1));
      }
    }
    // Fallback démo : Ollama injoignable → réponse mockée au lieu d'erreur
    if (!useMockFallback) {
      const raw = lastError?.message ?? "";
      if (/fetch|ECONNREFUSED|timeout|ETIMEDOUT|network|abort/i.test(raw)) {
        useMockFallback = true;
        await sleep(800);
        return { content: mockChatResponse(messages) };
      }
    }
    throw lastError ?? new Error("Ollama chat failed");
  }

  /**
   * Chat en streaming — Ollama envoie du JSON pur ligne par ligne.
   * Chaque ligne : { message: { content: "..." }, done: false }
   * Dernière ligne : { done: true }
   */
  async chatStream(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    opts: VLLMChatOptions = {}
  ): Promise<string> {
    const timeout = opts.timeout ?? this.timeout;

    if (this.mock || useMockFallback) {
      await sleep(800);
      const content = mockChatResponse(messages);
      for (const word of content.split(/(\s+)/)) {
        onChunk(word);
        await sleep(20);
      }
      return content;
    }

    // Format Ollama streaming : /api/chat avec stream: true
    const url = `${this.baseUrl}/api/chat`;
    const body = {
      model: opts.model ?? AI_CONFIG.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    };

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (streamErr) {
      clearTimeout(id);
      const raw = streamErr instanceof Error ? streamErr.message : String(streamErr);
      if (/fetch|ECONNREFUSED|timeout|ETIMEDOUT|network|abort/i.test(raw)) {
        useMockFallback = true;
        await sleep(800);
        const content = mockChatResponse(messages);
        for (const word of content.split(/(\s+)/)) {
          onChunk(word);
          await sleep(20);
        }
        return content;
      }
      throw streamErr;
    }
    clearTimeout(id);

    if (!res.ok) throw new Error(`Ollama ${res.status}`);

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Garder la dernière ligne incomplète dans le buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            // Ollama stream : JSON pur, pas de préfixe "data: "
            const json = JSON.parse(line) as {
              message?: { content?: string };
              done?: boolean;
            };
            const text = json.message?.content ?? "";
            if (text) {
              full += text;
              onChunk(text);
            }
            if (json.done) break;
          } catch {
            // ignore les lignes non-JSON
          }
        }
      }
    }
    return full;
  }

  /**
   * GET /api/tags — vérifie qu'Ollama est disponible et liste les modèles.
   */
  async healthCheck(): Promise<VLLMHealthResult> {
    if (this.mock) {
      return { available: true, model: "mock (AI_MOCK=true)", latencyMs: 0 };
    }

    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        useMockFallback = true;
        return { available: true, model: "mock (démo)", latencyMs: 0 };
      }

      // Ollama retourne { models: [{ name, model, ... }] }
      const data = (await res.json()) as {
        models?: Array<{ name: string; model: string }>;
      };

      useMockFallback = false;
      // Trouver le modèle configuré dans la liste
      const configuredModel = AI_CONFIG.model;
      const found = data.models?.find(
        (m) => m.name === configuredModel || m.model === configuredModel
      );
      const model = found?.name ?? configuredModel;

      return { available: true, model, latencyMs };
    } catch (err) {
      useMockFallback = true;
      return {
        available: true,
        model: "mock (démo)",
        latencyMs: Date.now() - start,
      };
    }
  }
}

export const vllmClient = new VLLMClient();
