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
  const [accentColor, setAccentColor] = useStoredAccent("#1a4b8f");
  const [notificationLevel, setNotificationLevel] = useNotificationLevel();
  const [currentStep, setCurrentStep] = useState(0);

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
            <label className="block min-w-[140px]">
              <span className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>Fournisseur</span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
              >
                <option value="">Choisir...</option>
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
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
            <Button
              onClick={() => {
                finishWizard();
                setCurrentStep(4);
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
      label: "Terminé",
      content: (
        <div className="space-y-4">
          <Panel variant="success" title="Configuration enregistrée">
            Ton app est prête. Tu pourras modifier ces réglages à tout moment dans Paramètres.
          </Panel>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button>Aller au tableau de bord</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Ouvrir les paramètres</Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="doc-page max-w-2xl">
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/settings" className="underline hover:no-underline">Paramètres</Link>
        <span className="mx-2">/</span>
        <span>Assistant de configuration</span>
      </nav>
      <div className="doc-page-header mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Assistant de configuration
        </h1>
        <p className="doc-description mt-1">
          Quelques étapes pour paramétrer l&apos;app : thème, couleur, clés API et notifications.
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
