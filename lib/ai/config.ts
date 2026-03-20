/**
 * Configuration IA — Ollama local (Mistral:7b par défaut).
 * AI_SERVER_URL dans .env pointe vers le VPS Ollama.
 * AI_MOCK=true pour développement sans serveur.
 */

export const AI_CONFIG = {
  baseUrl: process.env.AI_SERVER_URL ?? "http://localhost:11434",
  mock: process.env.AI_MOCK === "true",
  timeout: parseInt(process.env.AI_TIMEOUT ?? "120", 10) * 1000,
  maxRetries: parseInt(process.env.AI_MAX_RETRIES ?? "2", 10),
  model: process.env.AI_MODEL ?? "mistral:7b",
} as const;
