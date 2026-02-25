"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Stepper,
  Button,
  Panel,
  Title,
  Toggle,
  ColorPicker,
  Selectbox,
  Input,
  Textarea,
  Spinner,
} from "@/components/bpm";
import { useTheme } from "@/components/ThemeProvider";

const BPM_ACCENT_STORAGE = "bpm-accent-color";
const NOTIFICATION_LEVEL_STORAGE = "bpm-notification-level";
const WIZARD_DONE_STORAGE = "bpm-wizard-done";

const PROVIDERS = ["OpenAI", "Anthropic", "Google", "Groq", "Other"];

type ApiKeyRow = { id: string; provider: string; keyMasked: string; isActive: boolean; createdAt: string };

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

export default function SettingsWizardPage() {
  const { theme, toggleTheme } = useTheme();
  const [accentColor, setAccentColor] = useStoredAccent("#00a3e2");
  const [notificationLevel, setNotificationLevel] = useNotificationLevel();
  const [currentStep, setCurrentStep] = useState(0);

  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiDescription, setAiDescription] = useState("");
  const [aiCode, setAiCode] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadKeys = () => {
    fetch("/api/settings/api-keys")
      .then((r) => (r.ok ? r.json() : []))
      .then(setKeys)
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKeys();
  }, []);

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

  const finishWizard = () => {
    try {
      localStorage.setItem(WIZARD_DONE_STORAGE, "1");
    } catch {
      // ignore
    }
  };

  const generateFromAI = async () => {
    if (!aiDescription.trim() || aiGenerating) return;
    setAiGenerating(true);
    setAiError(null);
    setAiCode("# Génération en cours…");
    try {
      const res = await fetch("/api/sandbox/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDescription }),
        credentials: "include",
      });
      if (!res.ok) {
        const errBody = await res.text();
        let msg = `Erreur ${res.status}`;
        try {
          const data = JSON.parse(errBody) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          /* garder msg par défaut */
        }
        setAiError(msg);
        setAiCode("");
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
              const data = JSON.parse(line.slice(6)) as { type: string; t?: string; message?: string };
              if (data.type === "chunk" && data.t) {
                full += data.t;
                const validLines = full
                  .split("\n")
                  .filter((l) => l.trim().startsWith("bpm.") || l.trim() === "" || l.trim().startsWith("#"))
                  .join("\n");
                setAiCode(validLines);
              }
              if (data.type === "error") {
                const raw = data.message ?? "Erreur inconnue";
                const friendly =
                  /network error|failed to fetch|fetch failed|econnrefused|econnreset|network request failed/i.test(raw)
                    ? "Impossible de joindre le service de génération. Vérifiez que Ollama est démarré (http://localhost:11434) ou définissez AI_MOCK=true dans .env.local pour le mode démo."
                    : raw;
                setAiError(friendly);
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erreur réseau";
      const friendly =
        /network error|failed to fetch|fetch failed|econnrefused|econnreset|network request failed/i.test(raw)
          ? "Impossible de joindre le service de génération. Vérifiez que Ollama est démarré (http://localhost:11434) ou définissez AI_MOCK=true dans .env.local pour le mode démo."
          : raw;
      setAiError(friendly);
      setAiCode("");
    } finally {
      setAiGenerating(false);
    }
  };

  const openInSandbox = () => {
    if (aiCode.trim()) {
      try {
        sessionStorage.setItem("sandbox-pending-code", aiCode);
      } catch {
        /* ignore */
      }
    }
  };

  const steps = [
    {
      id: "theme",
      label: "Thème",
      content: (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Choisis l&apos;apparence générale de l&apos;app (clair ou sombre).
          </p>
          <div className="flex items-center justify-between p-4 rounded-xl border max-w-md" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <div>
              <p className="font-medium" style={{ color: "var(--bpm-text-primary)" }}>Thème sombre</p>
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Activer le mode sombre</p>
            </div>
            <Toggle value={theme === "dark"} onChange={toggleTheme} label="" />
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setCurrentStep(1)}>Suivant</Button>
          </div>
        </div>
      ),
    },
    {
      id: "accent",
      label: "Couleur d'accent",
      content: (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Couleur principale des boutons et des liens.
          </p>
          <div className="p-4 rounded-xl border max-w-md" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <ColorPicker label="Couleur d'accent" value={accentColor} onChange={setAccentColor} />
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(0)}>Précédent</Button>
            <Button onClick={() => setCurrentStep(2)}>Suivant</Button>
          </div>
        </div>
      ),
    },
    {
      id: "apikeys",
      label: "Clés API",
      optional: true,
      content: (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Ajoute une clé pour utiliser l&apos;IA (OpenAI, Anthropic, etc.). Tu pourras en ajouter d&apos;autres plus tard dans Paramètres.
          </p>
          {error && (
            <Panel variant="error" title="Erreur">
              {error}
            </Panel>
          )}
          <form onSubmit={addKey} className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[140px]">
              <Selectbox
                label="Fournisseur"
                options={PROVIDERS}
                value={provider}
                onChange={setProvider}
                placeholder="Choisir..."
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
          {!loading && keys.length > 0 && (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Clé(s) enregistrée(s) : {keys.map((k) => k.provider).join(", ")}.
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>Précédent</Button>
            <Button variant="outline" onClick={() => setCurrentStep(3)}>Passer</Button>
            <Button onClick={() => setCurrentStep(3)}>Suivant</Button>
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      content: (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Niveau minimum des notifications affichées dans la cloche.
          </p>
          <div className="p-4 rounded-xl border max-w-md" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <Selectbox
              label="Niveau minimum"
              value={notificationLevel}
              onChange={setNotificationLevel}
              options={[
                { value: "1", label: "Priorité haute uniquement (erreurs)" },
                { value: "2", label: "Priorité haute et moyenne" },
                { value: "3", label: "Toutes les notifications" },
              ]}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>Précédent</Button>
            <Button onClick={() => setCurrentStep(4)}>Suivant</Button>
          </div>
        </div>
      ),
    },
    {
      id: "sandbox-ia",
      label: "Sandbox IA",
      optional: true,
      content: (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Décrivez ce que vous voulez faire : l&apos;IA génère le code <code>bpm.*</code> correspondant. Vous pourrez l&apos;ouvrir dans la Sandbox pour voir l&apos;aperçu.
          </p>
          <div className="p-4 rounded-xl border max-w-full" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <Textarea
              label="Description"
              value={aiDescription}
              onChange={setAiDescription}
              placeholder={
                "Exemples :\n" +
                "• Un dashboard avec le CA mensuel, le taux de marge et un graphique de tendance\n" +
                "• Une page de suivi de contrats avec statut et date d'échéance\n" +
                "• Un formulaire de saisie de commande fournisseur"
              }
              rows={4}
            />
            {aiError && (
              <p className="text-sm mt-2" style={{ color: "var(--bpm-accent)" }}>
                ⚠ {aiError}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Button
                onClick={generateFromAI}
                disabled={aiGenerating || !aiDescription.trim()}
              >
                {aiGenerating ? "Génération…" : "Générer avec l'IA"}
              </Button>
              {aiGenerating && (
                <span className="inline-flex items-center gap-2" style={{ color: "var(--bpm-text-secondary)" }}>
                  <Spinner size="small" text="" className="shrink-0" />
                  <span className="text-xs">Génération en cours (~30-60s)…</span>
                </span>
              )}
            </div>
            {aiCode.trim() && !aiGenerating && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--bpm-border)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--bpm-text-secondary)" }}>
                  Code généré
                </p>
                <pre
                  className="p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto"
                  style={{
                    background: "var(--bpm-code-bg, #1e1e1e)",
                    color: "var(--bpm-text-primary)",
                    border: "1px solid var(--bpm-border)",
                  }}
                >
                  {aiCode}
                </pre>
                <Link href="/sandbox" onClick={openInSandbox} className="inline-block mt-2 text-sm" style={{ color: "var(--bpm-accent)" }}>
                  Ouvrir dans la Sandbox pour voir l&apos;aperçu →
                </Link>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>Précédent</Button>
            <Button variant="outline" onClick={() => { finishWizard(); setCurrentStep(5); }}>Passer</Button>
            <Button
              onClick={() => {
                finishWizard();
                setCurrentStep(5);
              }}
            >
              Terminer
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "done",
      label: "Terminer",
      content: (
        <div className="space-y-4">
          <Panel variant="success" title="Configuration enregistrée">
            Ton app est prête. Tu pourras modifier ces réglages à tout moment dans Paramètres.
          </Panel>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button>Aller au tableau de bord</Button>
            </Link>
            <Link href="/sandbox">
              <Button variant="outline">Ouvrir la Sandbox</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Ouvrir les paramètres</Button>
            </Link>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(4)}>Précédent</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="doc-page max-w-2xl">
      <div className="doc-page-header mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Assistant de configuration
        </h1>
        <p className="doc-description mt-1">
          Quelques étapes pour paramétrer l&apos;app : thème, couleur, clés API, notifications, essai Sandbox IA, puis terminer.
        </p>
      </div>

      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(i) => setCurrentStep(i)}
      />
    </div>
  );
}
