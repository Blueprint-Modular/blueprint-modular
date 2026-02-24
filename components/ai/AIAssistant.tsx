"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Button,
  Panel,
  Checkbox,
  Spinner,
  Markdown,
} from "@/components/bpm";
import { moduleRegistry } from "@/lib/ai/module-registry";
import { useAssistant } from "@/lib/ai/assistant-context";
import { VoiceRecorder } from "@/components/ai/VoiceRecorder";

type MessageRole = "user" | "assistant";
type ChatMessage = { role: MessageRole; content: string };

interface HealthState {
  available: boolean;
  model?: string;
  latencyMs?: number;
  error?: string;
}

export function AIAssistant() {
  const { data: session, status } = useSession();
  const assistantCtx = useAssistant();
  const open = assistantCtx?.open ?? false;
  const setOpen = assistantCtx?.setOpen ?? (() => {});
  const extraContext = assistantCtx?.extraContext ?? null;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = assistantCtx ? open : internalOpen;
  const setIsOpen = assistantCtx ? setOpen : setInternalOpen;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [modules, setModules] = useState(moduleRegistry.getAllModules());
  const [health, setHealth] = useState<HealthState | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModules(moduleRegistry.getAllModules());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/ai/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ available: false, error: "Réseau" }));
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);
    setStreamingContent("");

    const history = messages.concat([{ role: "user", content: text }]);
    let contextText = extraContext ? `[Contexte contrat / document]\n${extraContext}\n\n` : "";
    if (selectedModuleIds.length > 0) {
      const { text: ctx } = await moduleRegistry.buildContext(selectedModuleIds);
      contextText += ctx;
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          provider_name: "vllm",
          conversation_history: history.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
          context_from_modules: contextText || undefined,
        }),
      });
      if (!res.ok) {
        setStreamingContent(`Erreur: ${res.status}`);
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
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as { type: string; t?: string; message?: string };
                if (data.type === "chunk" && data.t) {
                  full += data.t;
                  setStreamingContent(full);
                }
                if (data.type === "error") {
                  setStreamingContent((prev) => prev + `\n[Erreur: ${data.message}]`);
                }
              } catch {
                // ignore
              }
            }
          }
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: full || streamingContent }]);
      setStreamingContent("");
    } catch (err) {
      setStreamingContent(`Erreur: ${err instanceof Error ? err.message : "Réseau"}`);
    } finally {
      setStreaming(false);
    }
  };

  const toggleModule = (moduleId: string, checked: boolean) => {
    setSelectedModuleIds((prev) =>
      checked ? [...prev, moduleId] : prev.filter((id) => id !== moduleId)
    );
  };

  if (status === "loading" || !session) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg md:bottom-6"
        style={{
          background: "var(--bpm-accent-cyan)",
          color: "#fff",
        }}
        aria-label="Ouvrir l'assistant IA"
      >
        <span className="text-xl">✦</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] md:inset-auto md:left-auto md:right-0 md:top-0 md:h-full md:w-[420px] md:shadow-2xl"
          style={{
            background: "var(--bpm-bg-primary)",
            borderLeft: "1px solid var(--bpm-border)",
          }}
        >
          <div className="flex h-full flex-col">
            <div
              className="flex shrink-0 items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--bpm-border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: health?.available ? "var(--bpm-accent-mint)" : "var(--bpm-accent)",
                  }}
                />
                <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                  Assistant IA
                </span>
                {health?.model && (
                  <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                    {health.model}
                  </span>
                )}
              </div>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Fermer
              </Button>
            </div>

            <div
              className="shrink-0 border-b px-4 py-2"
              style={{ borderColor: "var(--bpm-border)" }}
            >
              <div className="text-xs font-medium mb-2" style={{ color: "var(--bpm-text-secondary)" }}>
                Contexte (modules à inclure)
              </div>
              {extraContext && (
                <p className="text-xs mb-2 rounded px-2 py-1" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-accent-cyan)" }}>
                  Contrat / document ajouté au contexte pour cette conversation.
                </p>
              )}
              {modules.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                  Aucun module enregistré. Les modules Wiki et Documents s&apos;enregistrent automatiquement.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {modules.map((m) => (
                    <label key={m.moduleId} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedModuleIds.includes(m.moduleId)}
                        onChange={(checked) => toggleModule(m.moduleId, checked)}
                        label=""
                      />
                      <span style={{ color: "var(--bpm-text-primary)" }}>{m.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 && !streamingContent && (
                <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                  Posez une question. Exemple : &quot;Quels modules sont disponibles ?&quot;
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div
                    className="text-xs font-medium"
                    style={{
                      color: m.role === "user" ? "var(--bpm-accent)" : "var(--bpm-accent-mint)",
                    }}
                  >
                    {m.role === "user" ? "Vous" : "IA"}
                  </div>
                  {m.role === "assistant" ? (
                    <div className="text-sm prose prose-sm max-w-none" style={{ color: "var(--bpm-text-primary)" }}>
                      <Markdown text={m.content} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>
                      {m.content}
                    </p>
                  )}
                </div>
              ))}
              {streamingContent && (
                <div className="space-y-1">
                  <div className="text-xs font-medium" style={{ color: "var(--bpm-accent-mint)" }}>
                    IA
                  </div>
                  <div className="text-sm prose prose-sm max-w-none" style={{ color: "var(--bpm-text-primary)" }}>
                    <Markdown text={streamingContent} />
                  </div>
                </div>
              )}
              {streaming && !streamingContent && (
                <div className="flex items-center gap-2">
                  <Spinner size="small" />
                  <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                    Réflexion…
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              className="shrink-0 border-t p-4"
              style={{ borderColor: "var(--bpm-border)" }}
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Votre question… (Cmd+Enter pour envoyer)"
                rows={2}
                className="w-full rounded border px-3 py-2 text-sm resize-none mb-2"
                style={{
                  borderColor: "var(--bpm-border)",
                  background: "var(--bpm-bg-primary)",
                  color: "var(--bpm-text-primary)",
                }}
              />
              <div className="flex items-center gap-2 mb-2">
                <VoiceRecorder
                  onTranscription={(text) => {
                    setInput((prev) => (prev ? `${prev} ${text}` : text));
                    setVoiceError(null);
                  }}
                  onError={setVoiceError}
                  label="Dicter"
                  disabled={streaming}
                />
                {voiceError && (
                  <span className="text-xs" style={{ color: "var(--bpm-accent)" }}>
                    ⚠ {voiceError}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={streaming || !input.trim()}>
                {streaming ? "Envoi…" : "Envoyer"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
