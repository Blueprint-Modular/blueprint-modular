"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/bpm";

type MessageRole = "user" | "assistant";
type ChatMessage = { role: MessageRole; content: string };

export function AIChat() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [provider, setProvider] = useState<"claude" | "openai" | "gemini" | "grok">("claude");
  const bottomRef = useRef<HTMLDivElement>(null);

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

    const history = messages
      .concat([{ role: "user", content: text }])
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          provider_name: provider,
          conversation_history: history.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
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
                // ignore parse errors
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

  if (status === "loading") {
    return (
      <div className="p-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Chargement...
      </div>
    );
  }
  if (!session) {
    return (
      <div className="p-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Connectez-vous pour utiliser l&apos;assistant IA.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}>
      <div className="flex items-center gap-2 p-2 border-b flex-wrap" style={{ borderColor: "var(--bpm-border)" }}>
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Modèle:</span>
        {(["claude", "openai", "gemini", "grok"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProvider(p)}
            className={`px-2 py-1 rounded text-sm ${provider === p ? "btn-primary" : "btn-secondary"}`}
          >
            @{p}
          </button>
        ))}
        <span className="text-xs ml-2" style={{ color: "var(--bpm-text-secondary)" }}>
          Contexte: $wiki $documents $component:metric
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !streamingContent && (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Posez une question. Utilisez @claude, @gpt, @gemini ou @grok pour changer de modèle.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="space-y-1">
            <div className="text-xs font-medium" style={{ color: m.role === "user" ? "var(--bpm-accent)" : "var(--bpm-accent-mint)" }}>
              {m.role === "user" ? "Vous" : "IA"}
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{m.content}</p>
          </div>
        ))}
        {streamingContent && (
          <div className="space-y-1">
            <div className="text-xs font-medium" style={{ color: "var(--bpm-accent-mint)" }}>IA</div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{streamingContent}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        className="p-4 border-t flex gap-2"
        style={{ borderColor: "var(--bpm-border)" }}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 px-3 py-2 rounded border text-sm"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          {streaming ? "..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
