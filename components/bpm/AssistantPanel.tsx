"use client";

import { useState, useRef, useEffect } from "react";
import { Panel, Markdown, Spinner } from "@/components/bpm";
import { bpmComponentRegistry } from "@/lib/ai/context";

const PRODUCTION_QUESTIONS = [
  "Pourquoi mon TRS est-il en baisse cette semaine ?",
  "Quelle ligne a le plus mauvais TRS ?",
  "Mes pertes matière sont-elles normales ?",
  "Que me recommandes-tu pour améliorer la performance ?",
] as const;

export interface AssistantPanelProps {
  /** Si fourni, les chips affichent les réponses statiques (démo publique, pas d'appel API). */
  demoAnswers?: Record<string, string>;
  /** Titre du panneau */
  title?: string;
  /** Rendu inline (pas de position fixed) pour la page démo /components. */
  demo?: boolean;
  className?: string;
}

export function AssistantPanel({
  demoAnswers,
  title = "Assistant Production",
  demo = false,
  className = "",
}: AssistantPanelProps) {
  const [open, setOpen] = useState(demo);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answer]);

  const handleChipClick = async (question: string) => {
    setSelectedQuestion(question);
    setError(null);
    if (demoAnswers && demoAnswers[question] != null) {
      setAnswer(demoAnswers[question]);
      return;
    }
    setAnswer("");
    setStreaming(true);
    try {
      const pageContext = bpmComponentRegistry.buildSystemPromptContext();
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: question,
          provider_name: "vllm",
          mode: "assistant",
          page_context: pageContext || undefined,
          conversation_history: [],
        }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        let msg = `Erreur ${res.status}`;
        try {
          const data = JSON.parse(errBody) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          /* garder msg */
        }
        setError(msg);
        setStreaming(false);
        return;
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; t?: string };
              if (data.type === "chunk" && data.t) {
                full += data.t;
                setAnswer(full);
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
      setAnswer(full);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div
      className={className}
      style={demo ? { position: "relative", minHeight: 320 } : undefined}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={demo ? "flex h-12 w-12 items-center justify-center rounded-full shadow-lg" : "fixed bottom-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg md:bottom-6"}
        style={{
          background: "var(--bpm-accent)",
          color: "var(--bpm-accent-contrast)",
        }}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant Production"}
      >
        <span className="text-xl">✦</span>
      </button>

      {open && (
        <div
          className={demo ? "flex flex-col mt-3 rounded-lg" : "fixed inset-0 z-[100] md:inset-auto md:left-auto md:right-0 md:top-0 md:h-full md:w-[420px] md:shadow-2xl flex flex-col"}
          style={{
            background: "var(--bpm-bg-primary)",
            borderLeft: demo ? undefined : "1px solid var(--bpm-border)",
            ...(demo ? { border: "1px solid var(--bpm-border)", maxHeight: 280, overflow: "hidden" } : {}),
          }}
        >
          <div
            className="flex shrink-0 items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--bpm-border)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
              {title}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm underline"
              style={{ color: "var(--bpm-accent)" }}
            >
              Fermer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            <p className="text-xs font-medium" style={{ color: "var(--bpm-text-secondary)" }}>
              Questions pré-configurées
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCTION_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleChipClick(q)}
                  disabled={streaming}
                  className="rounded-full px-3 py-1.5 text-sm border transition"
                  style={{
                    borderColor: "var(--bpm-border)",
                    background: selectedQuestion === q ? "var(--bpm-accent)" : "var(--bpm-bg-secondary)",
                    color: selectedQuestion === q ? "var(--bpm-accent-contrast)" : "var(--bpm-text)",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {error && (
              <Panel variant="error" title="Erreur">
                {error}
              </Panel>
            )}

            {streaming && !answer && (
              <div className="flex items-center gap-2">
                <Spinner size="small" />
                <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                  Réflexion…
                </span>
              </div>
            )}

            {answer && (
              <div className="space-y-1">
                {selectedQuestion && (
                  <p className="text-xs font-medium" style={{ color: "var(--bpm-text-secondary)" }}>
                    {selectedQuestion}
                  </p>
                )}
                <div
                  className="text-sm prose prose-sm max-w-none"
                  style={{ color: "var(--bpm-text-primary)" }}
                >
                  <Markdown text={answer ?? ""} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}
