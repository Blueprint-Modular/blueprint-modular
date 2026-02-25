"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Tabs,
  Button,
  Panel,
  Title,
  Toggle,
  ColorPicker,
  Selectbox,
  Input,
} from "@/components/bpm";
import { useTheme } from "@/components/ThemeProvider";

type ApiKeyRow = { id: string; provider: string; keyMasked: string; isActive: boolean; createdAt: string };

const PROVIDERS = ["OpenAI", "Anthropic", "Google", "Groq", "Other"];

const BPM_ACCENT_STORAGE = "bpm-accent-color";
const NOTIFICATION_LEVEL_STORAGE = "bpm-notification-level";
export const BPM_ASSISTANT_NAME_STORAGE = "bpm-assistant-name";

function useStoredAccent(defaultHex: string) {
  const [accent, setAccent] = useState(defaultHex);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BPM_ACCENT_STORAGE);
      if (stored && /^#[0-9A-Fa-f]{6}$/.test(stored)) {
        setAccent(stored);
        document.documentElement.style.setProperty("--bpm-accent", stored);
      }
    } catch {
      // ignore
    }
  }, []);
  const setAccentAndStore = (hex: string) => {
    setAccent(hex);
    try {
      localStorage.setItem(BPM_ACCENT_STORAGE, hex);
      document.documentElement.style.setProperty("--bpm-accent", hex);
    } catch {
      // ignore
    }
  };
  return [accent, setAccentAndStore] as const;
}

function useNotificationLevel() {
  const [level, setLevel] = useState("3");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_LEVEL_STORAGE);
      if (stored && ["1", "2", "3"].includes(stored)) setLevel(stored);
    } catch {
      // ignore
    }
  }, []);
  const setLevelAndStore = (value: string) => {
    setLevel(value);
    try {
      localStorage.setItem(NOTIFICATION_LEVEL_STORAGE, value);
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("bpm-notification-level-updated"));
    } catch {
      // ignore
    }
  };
  return [level, setLevelAndStore] as const;
}

function useStoredAssistantName() {
  const [name, setName] = useState("Assistant");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BPM_ASSISTANT_NAME_STORAGE);
      if (stored && stored.trim()) setName(stored.trim());
    } catch {
      // ignore
    }
  }, []);
  const setNameAndStore = (value: string) => {
    const v = value.trim() || "Assistant";
    setName(v);
    try {
      localStorage.setItem(BPM_ASSISTANT_NAME_STORAGE, v);
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("bpm-assistant-name-updated", { detail: v }));
    } catch {
      // ignore
    }
  };
  return [name, setNameAndStore] as const;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [accentColor, setAccentColor] = useStoredAccent("#00a3e2");
  const [notificationLevel, setNotificationLevel] = useNotificationLevel();
  const [assistantName, setAssistantName] = useStoredAssistantName();

  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = () => {
    fetch("/api/settings/api-keys")
      .then((r) => (r.ok ? r.json() : []))
      .then(setKeys)
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadKeys(), []);

  const addKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim() || !keyValue.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.trim(), key: keyValue.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur");
      }
      setProvider("");
      setKeyValue("");
      loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) loadKeys();
    } catch {
      setError("Suppression échouée");
    }
  };

  const tabs = useMemo(
    () => [
      {
        label: "Profil",
        content: (
          <div className="space-y-6">
            <Title level={2}>Profil</Title>
            {status === "loading" && (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>
            )}
            {status === "authenticated" && session?.user && (
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                  {session.user.image ? (
                    <Image src={session.user.image} alt="" width={64} height={64} className="rounded-full shrink-0" />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-white shrink-0"
                      style={{ background: "var(--bpm-accent)" }}
                    >
                      {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
                      {session.user.name ?? "Utilisateur"}
                    </p>
                    <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
                  Se déconnecter
                </Button>
              </div>
            )}
            {status === "unauthenticated" && (
              <Panel variant="info" title="Non connecté">
                <Link href="/login" className="underline" style={{ color: "var(--bpm-accent)" }}>
                  Se connecter
                </Link>
                {" "}pour gérer votre profil.
              </Panel>
            )}
          </div>
        ),
      },
      {
        label: "Apparence",
        content: (
          <div className="space-y-6">
            <Title level={2}>Apparence</Title>
            <div className="max-w-md space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                <div>
                  <p className="font-medium" style={{ color: "var(--bpm-text-primary)" }}>Thème sombre</p>
                  <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Basculer entre clair et sombre</p>
                </div>
                <Toggle value={theme === "dark"} onChange={toggleTheme} label="" />
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                <ColorPicker
                  label="Couleur d'accent"
                  value={accentColor}
                  onChange={setAccentColor}
                />
                <p className="text-sm mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
                  Couleur principale des boutons et liens
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        label: "Clés API",
        content: (
          <div className="space-y-6">
            <Title level={2}>Clés API</Title>
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Préférences et clés API (chiffrées). Ajoutez une clé pour utiliser l&apos;IA (OpenAI, Anthropic, etc.).
            </p>
            {error && (
              <Panel variant="error" title="Erreur">
                {error}
              </Panel>
            )}
            <form onSubmit={addKey} className="flex flex-wrap gap-4 items-end mb-4">
              <div className="min-w-[140px]">
                <Selectbox
                  label="Fournisseur"
                  options={PROVIDERS}
                  value={provider}
                  onChange={setProvider}
                  placeholder="Choisir..."
                  required
                />
              </div>
              <div className="min-w-[200px]">
                <Input
                  label="Clé (secrète)"
                  type="password"
                  value={keyValue}
                  onChange={setKeyValue}
                  placeholder="sk-..."
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Ajout…" : "Ajouter"}
              </Button>
            </form>
            {loading ? (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>
            ) : keys.length === 0 ? (
              <Panel variant="info" title="Aucune clé">
                Ajoutez une clé pour utiliser l&apos;IA (OpenAI, Anthropic, etc.).
              </Panel>
            ) : (
              <ul className="space-y-2">
                {keys.map((k) => (
                  <li
                    key={k.id}
                    className="flex flex-wrap items-center gap-2 p-3 rounded-lg border"
                    style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
                  >
                    <span className="shrink-0" style={{ color: "var(--bpm-text-primary)" }}>{k.provider}</span>
                    <span className="text-sm font-mono min-w-0 truncate flex-1" style={{ color: "var(--bpm-text-secondary)" }}>{k.keyMasked}</span>
                    <Button variant="outline" onClick={() => deleteKey(k.id)} className="shrink-0 w-full sm:w-auto">Supprimer</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ),
      },
      {
        label: "Général",
        content: (
          <div className="space-y-6">
            <Title level={2}>Général</Title>
            <div className="max-w-md space-y-4">
              <div className="p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                <Selectbox
                  label="Niveau minimum de notifications (cloche)"
                  value={notificationLevel}
                  onChange={setNotificationLevel}
                  options={[
                    { value: "1", label: "Priorité haute uniquement (erreurs)" },
                    { value: "2", label: "Priorité haute et moyenne (erreurs + succès)" },
                    { value: "3", label: "Toutes les notifications" },
                  ]}
                />
                <p className="text-sm mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
                  Filtre les notifications affichées dans la cloche
                </p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                <Input
                  label="Nom de l'assistant IA"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  placeholder="Assistant"
                />
                <p className="text-sm mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
                  Libellé affiché pendant la génération de page (ex. &quot;Assistant génère votre page…&quot;)
                </p>
              </div>
            </div>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters stables (contexte/setState)
    [
      status,
      session,
      theme,
      accentColor,
      notificationLevel,
      assistantName,
      keys,
      loading,
      provider,
      keyValue,
      saving,
      error,
    ]
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>Paramètres</h1>
        <p className="doc-description">
          Profil, apparence, clés API et préférences générales. Thème clair/sombre, couleur d&apos;accent, niveau des notifications.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Configuration</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/settings/wizard" className="underline" style={{ color: "var(--bpm-accent)" }}>
            Relancer l&apos;assistant de configuration
          </Link>
        </p>
      </div>

      <Tabs tabs={tabs} defaultTab={0} />
    </div>
  );
}
