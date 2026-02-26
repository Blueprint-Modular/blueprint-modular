"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getDollarSuggestions } from "./ai-suggestions";
import { moduleRegistry } from "@/lib/ai/module-registry";
import { VoiceRecorder } from "@/components/ai/VoiceRecorder";
import { Button, Badge } from "@/components/bpm";
import "./AIChat.css";

const PROVIDER_ALIAS: Record<string, string> = {
  claude: "claude",
  ollama: "vllm",
  qwen: "qwen",
  mistral: "mistral",
};

const AT_COLORS: Record<string, string> = {
  claude: "#F97316",
  vllm: "var(--bpm-accent)",
  qwen: "var(--bpm-accent)",
  mistral: "#FA4C0A",
};

/** Modèles disponibles (sans GPT, Gemini, Grok). Libellé affiché pour l'assistant = prop assistantName (paramétrable). */
const PROVIDERS_LIST = [
  { id: "vllm", shortLabel: "Assistant", color: AT_COLORS.vllm },
  { id: "qwen", shortLabel: "Assistant", color: AT_COLORS.qwen },
  { id: "mistral", shortLabel: "Mistral", color: AT_COLORS.mistral },
  { id: "claude", shortLabel: "Claude", color: AT_COLORS.claude },
];

const EXCLUDED_PROVIDERS = new Set(["openai", "gemini", "grok"]);

function highlightAtAndDollar(text: string): React.ReactNode {
  if (typeof text !== "string") return text;
  const re = /(@[a-zA-Z0-9_.]+|\$[a-zA-Z]+(?::[^;\s]+)?(?:;[^\s]+)?|(?<!\w)#[a-zA-ZÀ-ÿ0-9_-]+)/g;
  const parts = text.split(re);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("@")) {
      const name = part.slice(1).toLowerCase();
      const providerId = PROVIDER_ALIAS[name] ?? name;
      const color = AT_COLORS[providerId] ?? "var(--bpm-accent-cyan)";
      return (
        <span key={`ad-${i}`} className="bpm-ai-at-mention" data-provider={providerId || "other"} style={{ color }}>
          {part}
        </span>
      );
    }
    if (part.startsWith("$")) {
      return (
        <span key={`ad-${i}`} className="bpm-ai-accent">
          {part}
        </span>
      );
    }
    if (part.startsWith("#")) {
      return (
        <span key={`ad-${i}`} className="bpm-ai-tag">
          {part}
        </span>
      );
    }
    return part;
  });
}

type ChatMsg = { role: "user" | "assistant"; content: string; provider?: string; error?: boolean; createdAt?: number };

function MessageBubble({
  message,
  assistantName,
  onRetry,
  previousUserContent,
  isExpanded,
  onToggle,
}: {
  message: ChatMsg;
  assistantName: string;
  onRetry?: (userMessage: string) => void;
  previousUserContent?: string;
  /** Si défini, l'heure n'est affichée qu'au clic sur la bulle (comportement type SMS Android). */
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const timeStr =
    message.createdAt != null
      ? new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : null;
  const showTime = timeStr && (onToggle === undefined ? true : isExpanded);
  const handleBubbleClick = onToggle
    ? (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest("a") || (e.target as HTMLElement).closest("button")) return;
        onToggle();
      }
    : undefined;

  if (message.role === "assistant") {
    const isError = message.error === true;
    return (
      <div
        className={`bpm-ai-message bpm-ai-message--assistant${isError ? " bpm-ai-message--error" : ""}${showTime ? " bpm-ai-message--expanded" : ""}`}
        onClick={handleBubbleClick}
        role={onToggle ? "button" : undefined}
        tabIndex={onToggle ? 0 : undefined}
        onKeyDown={onToggle ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } } : undefined}
        aria-label={onToggle && timeStr ? "Cliquer pour afficher l'heure" : undefined}
      >
        <div className="bpm-ai-message-header">
          <span className="bpm-ai-message-provider" style={{ color: "var(--bpm-accent)" }}>
            {assistantName}:
          </span>
          {isError && (
            <span className="bpm-ai-message-actions">
              <Badge variant="error" className="bpm-ai-message-error-badge">Erreur</Badge>
              {onRetry && previousUserContent && (
                <span onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="small" onClick={() => onRetry(previousUserContent)}>
                    ↺ Réessayer
                  </Button>
                </span>
              )}
            </span>
          )}
        </div>
        <div className="bpm-ai-message-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              text: ({ children }) => <>{highlightAtAndDollar(String(children))}</>,
            }}
          >
            {message.content || ""}
          </ReactMarkdown>
        </div>
        {timeStr && (
          <div className={`bpm-ai-message-footer${showTime ? " bpm-ai-message-footer--visible" : ""}`}>
            {timeStr}
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className={`bpm-ai-message bpm-ai-message--user${showTime ? " bpm-ai-message--expanded" : ""}`}
      onClick={handleBubbleClick}
      role={onToggle ? "button" : undefined}
      tabIndex={onToggle ? 0 : undefined}
      onKeyDown={onToggle ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } } : undefined}
      aria-label={onToggle && timeStr ? "Cliquer pour afficher l'heure" : undefined}
    >
      <div className="bpm-ai-message-body">{highlightAtAndDollar(message.content || "")}</div>
      {timeStr && (
        <div className={`bpm-ai-message-footer${showTime ? " bpm-ai-message-footer--visible" : ""}`}>
          {timeStr}
        </div>
      )}
    </div>
  );
}

export interface AIChatProps {
  historyOpen?: boolean;
  onCloseHistory?: () => void;
  newDiscussionTrigger?: number;
  assistantName?: string;
}

const STORAGE_TITLES_KEY = "ia_discussion_titles";
const STORAGE_ACTIVE_DISCUSSION_ID_KEY = "bpm_ai_active_discussion_id";

export function AIChat({
  historyOpen = false,
  onCloseHistory,
  newDiscussionTrigger = 0,
  assistantName = "Assistant",
}: AIChatProps) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeProvider, setActiveProvider] = useState("vllm");
  const [isStreaming, setIsStreaming] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<{ provider_name: string; label: string; color?: string }[]>([]);
  const [showTokenSugg, setShowTokenSugg] = useState(false);
  const [tokenSuggestions, setTokenSuggestions] = useState<{ token: string; label: string; location?: string }[]>([]);
  const [historyConversations, setHistoryConversations] = useState<
    { id: string; preview?: string; createdAt: string; updated_at: string; messages: { user_message: string; ai_response: string; provider_name: string }[] }[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [currentDiscussionId, setCurrentDiscussionId] = useState<string | null>(null);
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});
  const [historyClosing, setHistoryClosing] = useState(false);
  const [historyOpenAnimationActive, setHistoryOpenAnimationActive] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [selectedContextModuleIds, setSelectedContextModuleIds] = useState<string[]>([]);
  const [streamProgress, setStreamProgress] = useState<{ startTime: number; tokenCount: number } | null>(null);
  const [expandedBubbleIndex, setExpandedBubbleIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasInitializedContext = useRef(false);
  useEffect(() => {
    if (hasInitializedContext.current) return;
    const ids = moduleRegistry.getAllModules().map((m) => m.moduleId);
    if (ids.length > 0) {
      setSelectedContextModuleIds(ids);
      hasInitializedContext.current = true;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputText && highlightRef.current && inputRef.current) {
      highlightRef.current.scrollTop = inputRef.current.scrollTop;
      highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  }, [inputText]);

  useEffect(() => {
    if (newDiscussionTrigger > 0) {
      setMessages([]);
      setCurrentDiscussionId(null);
      try {
        localStorage.removeItem(STORAGE_ACTIVE_DISCUSSION_ID_KEY);
      } catch {}
    }
  }, [newDiscussionTrigger]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_DISCUSSION_ID_KEY);
      if (stored && stored.length > 0) {
        setCurrentDiscussionId(stored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (currentDiscussionId == null) return;
    try {
      localStorage.setItem(STORAGE_ACTIVE_DISCUSSION_ID_KEY, currentDiscussionId);
    } catch {}
  }, [currentDiscussionId]);

  useEffect(() => {
    if (!historyOpen) return;
    setHistoryOpenAnimationActive(true);
  }, [historyOpen]);
  useEffect(() => {
    if (!historyOpen) setHistoryOpenAnimationActive(false);
  }, [historyOpen]);

  const requestCloseHistory = () => {
    if (historyOpen && !historyClosing) setHistoryClosing(true);
  };
  const handleHistoryPanelAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "history-dock-close") {
      onCloseHistory?.();
      setHistoryClosing(false);
    }
  };

  useEffect(() => {
    if (!historyOpen) return;
    setHistoryLoading(true);
    setSelectedHistoryId(null);
    fetch("/api/ai/conversations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: typeof historyConversations) => {
        setHistoryConversations(Array.isArray(data) ? data : []);
        try {
          const raw = localStorage.getItem(STORAGE_TITLES_KEY);
          setCustomTitles(raw ? JSON.parse(raw) : {});
        } catch {
          setCustomTitles({});
        }
      })
      .catch(() => setHistoryConversations([]))
      .finally(() => setHistoryLoading(false));
  }, [historyOpen]);

  useEffect(() => {
    if (status === "loading") return;
    fetch("/api/ai/providers", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { providers?: { provider_name: string; label: string; color?: string }[]; default_provider?: string }) => {
        const raw = data?.providers ?? PROVIDERS_LIST.map((p) => ({ provider_name: p.id, label: p.shortLabel, color: p.color }));
        const list = raw.filter((p) => !EXCLUDED_PROVIDERS.has(p.provider_name));
        setConfiguredProviders(list);
        if (data?.default_provider && list.some((x) => x.provider_name === data.default_provider)) {
          setActiveProvider(data.default_provider);
        }
      })
      .catch(() => setConfiguredProviders(PROVIDERS_LIST.map((p) => ({ provider_name: p.id, label: p.shortLabel, color: p.color }))));
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
    const dollarMatch = value.match(/\$(\w*)(?::(\w*))?$/);
    if (dollarMatch) {
      const tokenPrefix = dollarMatch[1];
      const sugg = getDollarSuggestions(tokenPrefix);
      setTokenSuggestions(sugg);
      setShowTokenSugg(sugg.length > 0);
    } else {
      setShowTokenSugg(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    const provider = configuredProviders.some((p) => p.provider_name === activeProvider) ? activeProvider : "vllm";
    setInputText("");
    setAttachedFiles([]);
    const now = Date.now();
    const userMsg: ChatMsg = { role: "user", content: text, createdAt: now };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "", provider, createdAt: now }]);
    const baseHistory = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    performSend(text, baseHistory);
  };

  const performSend = useCallback(async (text: string, baseHistory: { role: string; content: string }[]) => {
    const provider = configuredProviders.some((p) => p.provider_name === activeProvider) ? activeProvider : "vllm";
    setIsStreaming(true);
    setStreamProgress(null);
    abortRef.current = new AbortController();
    const removeLastAssistant = () =>
      setMessages((prev) => (prev.length >= 2 && prev[prev.length - 1].role === "assistant" ? prev.slice(0, -1) : prev));
    let contextFromModules: string | undefined;
    const moduleIds = selectedContextModuleIds.length > 0 ? selectedContextModuleIds : moduleRegistry.getAllModules().map((m) => m.moduleId);
    try {
      if (moduleIds.length > 0) {
        const { text: ctx } = await moduleRegistry.buildContext(moduleIds);
        contextFromModules = ctx?.trim() || undefined;
      }
    } catch {
      /* ignore */
    }
    const maxAttempts = 3;
    const backoffMs = 2000;
    let lastRes: Response | null = null;
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        lastErr = null;
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            provider_name: provider,
            conversation_history: [...baseHistory, { role: "user", content: text }],
            discussion_id: currentDiscussionId ?? undefined,
            context_from_modules: contextFromModules,
          }),
          signal: abortRef.current.signal,
          credentials: "include",
        });
        lastRes = res;
        if (res.status === 401) {
          removeLastAssistant();
          setIsStreaming(false);
          setStreamProgress(null);
          return;
        }
        if (!res.ok && res.status >= 500 && attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        if (!res.ok) {
          const errBody = await res.text();
          let errMsg = `Le service a répondu ${res.status}`;
          try {
            const j = JSON.parse(errBody);
            if (typeof j?.error === "string") errMsg = j.error;
          } catch {
            if (errBody.slice(0, 100)) errMsg += ` — ${errBody.slice(0, 100)}`;
          }
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") next[next.length - 1] = { ...last, content: `*Erreur :* ${errMsg}`, error: true };
            return next;
          });
          break;
        }
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let full = "";
        let tokenCount = 0;
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              try {
                const data = JSON.parse(line.slice(6)) as { type: string; t?: string; discussion_id?: string; message?: string };
                if (data.type === "chunk" && data.t) {
                  full += data.t;
                  tokenCount += 1;
                  setStreamProgress((prev) =>
                    prev ? { ...prev, tokenCount } : { startTime: Date.now(), tokenCount: 1 }
                  );
                  setMessages((prev) => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last?.role === "assistant") next[next.length - 1] = { ...last, content: full };
                    return next;
                  });
                }
                if (data.type === "done" && data.discussion_id) setCurrentDiscussionId(data.discussion_id);
                if (data.type === "error") {
                  let errMsg = typeof data.message === "string" ? data.message : "Erreur lors de l'appel au modèle.";
                  if (/network error|failed to fetch|fetch failed|econnrefused|econnreset/i.test(errMsg)) {
                    errMsg = "Impossible de joindre le service IA. Vérifiez votre connexion et qu'Ollama est démarré (ex. http://localhost:11434), ou définissez AI_MOCK=true pour le mode démo.";
                  }
                  setMessages((prev) => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last?.role === "assistant") next[next.length - 1] = { ...last, content: `*Erreur :* ${errMsg}`, error: true };
                    return next;
                  });
                }
              } catch {
                /* ignore */
              }
            }
          }
        }
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { ...last, content: full || last.content };
          return next;
        });
        break;
      } catch (err) {
        lastRes = null;
        lastErr = err;
        if ((err as Error).name === "AbortError") {
          removeLastAssistant();
          break;
        }
        const isNetwork = /network error|failed to fetch|fetch failed|econnrefused|econnreset|network request failed|load failed/i.test(
          err instanceof Error ? err.message : String(err)
        );
        if (isNetwork && attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        const raw = err instanceof Error ? err.message : String(err);
        const errMsg = isNetwork
          ? "Impossible de joindre le service IA. Vérifiez votre connexion et qu'Ollama est démarré (ex. http://localhost:11434), ou définissez AI_MOCK=true pour le mode démo."
          : raw;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { ...last, content: `*Erreur :* ${errMsg}`, error: true };
          return next;
        });
        break;
      }
    }
    setStreamProgress(null);
    setIsStreaming(false);
    abortRef.current = null;
  }, [activeProvider, configuredProviders, currentDiscussionId, selectedContextModuleIds]);

  const handleRetry = useCallback((userContent: string) => {
    if (isStreaming) return;
    const i = messages.findIndex((m) => m.role === "assistant" && (m as ChatMsg & { error?: boolean }).error);
    if (i < 0) return;
    const next = [...messages];
    const provider = configuredProviders.some((p) => p.provider_name === activeProvider) ? activeProvider : "vllm";
    next[i] = { role: "assistant", content: "", provider };
    setMessages(next);
    const baseHistory = next.slice(0, -2).map((m) => ({ role: m.role, content: m.content })).slice(-10);
    setTimeout(() => performSend(userContent, baseHistory), 0);
  }, [messages, isStreaming, activeProvider, configuredProviders, performSend]);

  const selectedConversation = selectedHistoryId ? historyConversations.find((c) => c.id === selectedHistoryId) : null;
  const providerLabel = (name: string) =>
    name === "vllm" || name === "qwen" ? assistantName : (PROVIDERS_LIST.find((p) => p.id === name)?.shortLabel ?? name);
  const providerColor = (name: string) =>
    name === "vllm" || name === "qwen" ? "var(--bpm-accent)" : (PROVIDERS_LIST.find((p) => p.id === name)?.color ?? AT_COLORS[name] ?? "var(--bpm-text-secondary)");

  if (status === "loading") {
    return (
      <div className="p-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Chargement…
      </div>
    );
  }
  /* Plus de blocage si pas de session : l’API utilise getSessionOrTestUser / SKIP_AUTH_FOR_TEST. */

  return (
    <div className="bpm-ai-chat">
      {(historyOpen || historyClosing) && (
        <div
          className="bpm-ai-history-overlay"
          role="dialog"
          aria-label={`Historique des échanges avec ${assistantName}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) requestCloseHistory();
          }}
        >
          <div
            className={`bpm-ai-history-panel${historyOpenAnimationActive ? " tooltip-dock-open" : ""}${historyClosing ? " tooltip-dock-closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
            onAnimationEnd={handleHistoryPanelAnimationEnd}
          >
            <div className="bpm-ai-history-header">
              <h2 className="bpm-ai-history-title">Historique des échanges</h2>
              {historyConversations.length > 0 && (
                <button
                  type="button"
                  className="bpm-ai-history-clear-button"
                  onClick={() => {
                    if (!window.confirm(`Effacer tout l'historique des échanges avec ${assistantName} ?`)) return;
                    Promise.all(
                      historyConversations.map((d) =>
                        fetch(`/api/ai/conversations/${encodeURIComponent(d.id)}`, { method: "DELETE", credentials: "include" })
                      )
                    ).then(() => {
                      setHistoryConversations([]);
                      setSelectedHistoryId(null);
                      setCurrentDiscussionId(null);
                    });
                  }}
                >
                  Effacer
                </button>
              )}
            </div>
            <div className="bpm-ai-history-body">
              {historyLoading ? (
                <p className="bpm-ai-history-loading">Chargement…</p>
              ) : historyConversations.length === 0 ? (
                <p className="bpm-ai-history-empty">Aucun échange enregistré.</p>
              ) : selectedConversation ? (
                <>
                  <button type="button" className="bpm-ai-history-back" onClick={() => setSelectedHistoryId(null)}>
                    ← Liste
                  </button>
                  <div className="bpm-ai-history-detail">
                    {(selectedConversation.messages || []).map((msg, idx) => (
                      <React.Fragment key={idx}>
                        <MessageBubble
                          message={{ role: "user", content: msg.user_message }}
                          assistantName={assistantName}
                        />
                        <MessageBubble
                          message={{
                            role: "assistant",
                            content: msg.ai_response,
                            provider: msg.provider_name,
                          }}
                          assistantName={assistantName}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                <ul className="bpm-ai-history-list">
                  {historyConversations.map((d) => {
                    const date = d.updated_at ? new Date(d.updated_at) : (d.createdAt ? new Date(d.createdAt) : null);
                    const dateStr = date
                      ? date.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";
                    const displayPreview =
                      customTitles[d.id] !== undefined && customTitles[d.id] !== ""
                        ? customTitles[d.id]
                        : d.preview ?? "";
                    const msgCount = (d.messages || []).length;
                    const firstProvider = d.messages?.[0]?.provider_name;
                    return (
                      <li key={d.id} className="bpm-ai-history-row">
                        <button
                          type="button"
                          className="bpm-ai-history-item"
                          onClick={() => {
                            const msgs = (d.messages || []).flatMap((m) => [
                              { role: "user" as const, content: m.user_message },
                              {
                                role: "assistant" as const,
                                content: m.ai_response,
                                provider: m.provider_name,
                              },
                            ]);
                            setMessages(msgs);
                            setCurrentDiscussionId(d.id);
                            setSelectedHistoryId(null);
                            requestCloseHistory();
                          }}
                        >
                          <span className="bpm-ai-history-item-meta">
                            {firstProvider && (
                              <>
                                <span style={{ color: providerColor(firstProvider), fontWeight: "bold" }}>
                                  {providerLabel(firstProvider)}
                                </span>
                                {" · "}
                              </>
                            )}
                            {msgCount > 0 && (
                              <span className="bpm-ai-history-item-count">
                                {msgCount} message{msgCount > 1 ? "s" : ""}
                              </span>
                            )}
                            {msgCount > 0 && " · "}
                            {dateStr}
                          </span>
                          <span className="bpm-ai-history-item-preview">
                            {displayPreview ? displayPreview.charAt(0).toUpperCase() + displayPreview.slice(1) : ""}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="bpm-ai-history-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current =
                              customTitles[d.id] !== undefined && customTitles[d.id] !== "" ? customTitles[d.id] : d.preview ?? "";
                            const value = window.prompt("Modifier le titre de la conversation", current);
                            if (value !== null) {
                              const next = { ...customTitles, [d.id]: value.trim() };
                              setCustomTitles(next);
                              try {
                                localStorage.setItem(STORAGE_TITLES_KEY, JSON.stringify(next));
                              } catch {}
                            }
                          }}
                          aria-label="Modifier le titre"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                            <path d="M200-200h43.92l427.93-427.92-43.93-43.93L200-243.92V-200Zm-40 40v-100.77l527.23-527.77q6.15-5.48 13.57-8.47 7.43-2.99 15.49-2.99t15.62 2.54q7.55 2.54 13.94 9.15l42.69 42.93q6.61 6.38 9.04 14 2.42 7.63 2.42 15.25 0 8.13-2.74 15.56-2.74 7.42-8.72 13.57L260.77-160H160Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="bpm-ai-history-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!window.confirm("Supprimer cette discussion de l'historique ?")) return;
                            fetch(`/api/ai/conversations/${encodeURIComponent(d.id)}`, { method: "DELETE", credentials: "include" }).then((res) => {
                              if (res.status === 204 || res.ok) {
                                setHistoryConversations((prev) => prev.filter((c) => c.id !== d.id));
                                if (selectedHistoryId === d.id) setSelectedHistoryId(null);
                                if (currentDiscussionId === d.id) {
                                  setCurrentDiscussionId(null);
                                }
                                setCustomTitles((prev) => {
                                  const next = { ...prev };
                                  delete next[d.id];
                                  try {
                                    localStorage.setItem(STORAGE_TITLES_KEY, JSON.stringify(next));
                                  } catch {}
                                  return next;
                                });
                              }
                            });
                          }}
                          aria-label="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                            <path d="M304.62-160q-26.85 0-45.74-18.88Q240-197.77 240-224.62V-720h-40v-40h160v-30.77h240V-760h160v40h-40v495.38q0 27.62-18.5 46.12Q683-160 655.38-160H304.62ZM680-720H280v495.38q0 10.77 6.92 17.7 6.93 6.92 17.7 6.92h350.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93V-720Z" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bpm-ai-chat-messages">
        {messages.length === 0 && (
          <div className="bpm-ai-chat-welcome">
            <p>
              <strong>Discuter avec {assistantName}…</strong>
            </p>
            <p>
              <code>$</code> Données : <code>$wiki</code>, <code>$doc</code>, <code>$metric</code>, <code>$table</code>, <code>$chart</code>.
            </p>
            <p>
              <code>#</code> Filtres : <code>#Carrefour</code>, <code>#Signé</code>…
            </p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isLastEmpty = isStreaming && i === messages.length - 1 && msg.role === "assistant" && !(msg.content || "").trim();
          if (isLastEmpty) {
            return (
              <div key={i} className="bpm-ai-typing" aria-label="Réflexion en cours">
                <span className="bpm-ai-typing-dot" />
                <span className="bpm-ai-typing-dot" />
                <span className="bpm-ai-typing-dot" />
              </div>
            );
          }
          const prevUser =
            msg.role === "assistant" && (msg as ChatMsg & { error?: boolean }).error && i > 0 && messages[i - 1]?.role === "user"
              ? messages[i - 1].content
              : undefined;
          return (
            <MessageBubble
              key={i}
              message={msg}
              assistantName={assistantName}
              onRetry={msg.role === "assistant" && (msg as ChatMsg & { error?: boolean }).error ? handleRetry : undefined}
              previousUserContent={msg.role === "assistant" ? prevUser : undefined}
              isExpanded={expandedBubbleIndex === i}
              onToggle={() => setExpandedBubbleIndex((prev) => (prev === i ? null : i))}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bpm-ai-chat-input-wrap">
        {attachedFiles.length > 0 && (
          <div className="bpm-ai-chat-attached-files">
            {attachedFiles.map((f, idx) => (
              <span key={idx} className="bpm-ai-chat-attached-file">
                <span className="bpm-ai-chat-attached-file-name">{f.name}</span>
                <button
                  type="button"
                  className="bpm-ai-chat-attached-file-remove"
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label={`Retirer ${f.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div ref={inputRowRef} className="bpm-ai-chat-input-row">
          <div className="bpm-ai-chat-input-box">
            <div className="bpm-ai-chat-input-wrap-inner">
              {inputText && (
                <div ref={highlightRef} className="bpm-ai-chat-input-highlight" aria-hidden>
                  <div className="bpm-ai-chat-input-highlight-inner">{highlightAtAndDollar(inputText)}</div>
                </div>
              )}
              <textarea
                ref={inputRef}
                className={`bpm-ai-chat-input${inputText ? " bpm-ai-chat-input--highlight" : ""}`}
                aria-label="Zone de saisie de l'assistant"
                placeholder={
                  messages.length === 0
                    ? `Discuter avec ${assistantName}…`
                    : `Répondre à ${assistantName}…`
                }
                value={inputText}
                onChange={handleInputChange}
                onScroll={() => {
                  if (highlightRef.current && inputRef.current) {
                    highlightRef.current.scrollTop = inputRef.current.scrollTop;
                    highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isStreaming}
                rows={1}
              />
              <div className="bpm-ai-chat-input-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  aria-hidden
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setAttachedFiles((prev) => [...prev, ...files].slice(0, 5));
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="bpm-ai-chat-pj-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  aria-label="Joindre un fichier (PJ)"
                  title="Pièce jointe"
                >
                  {/* Icône Plus (Material) */}
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </button>
                <div className="bpm-ai-chat-mic-wrap">
                  <VoiceRecorder
                    iconOnly
                    className="bpm-ai-chat-pj-button"
                    disabled={isStreaming}
                    onTranscription={(text) => setInputText((prev) => (prev ? prev + " " + text : text))}
                  />
                </div>
                <button
                  type="button"
                  className="bpm-ai-chat-send-arrow"
                  onClick={() => {
                    if (!isStreaming && inputText.trim()) handleSend();
                  }}
                  disabled={isStreaming || !inputText.trim()}
                  aria-label="Envoyer"
                  title="Envoyer"
                >
                  {/* Flèche d'envoi (avion / send) */}
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2v7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showTokenSugg && (
          <div className="bpm-ai-suggestions-tooltip" role="listbox">
            {tokenSuggestions.slice(0, 14).map((s, i) => (
                <button
                  key={`${s.token}-${i}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="bpm-ai-sugg-tooltip-item"
                  onClick={() => {
                    const v = inputText.replace(/\$\w*(?::[\w-]*)?$/, s.token + " ");
                    setInputText(v);
                    setShowTokenSugg(false);
                    inputRef.current?.focus();
                  }}
                >
                  <span className="bpm-ai-sugg-tooltip-content">
                    <span className="bpm-ai-sugg-tooltip-primary">{s.label}</span>
                    <span className="bpm-ai-sugg-tooltip-secondary" title={s.location}>
                      {s.location ? `${s.token} · ${s.location}` : s.token}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
