"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import React from "react";
import {
  Panel,
  Message,
  Button,
  Metric,
  Table,
  Tabs,
  Title,
  Spinner,
  Tooltip,
  CodeBlock,
} from "@/components/bpm";

const DEFAULT_CODE = `bpm.title("Ma page", level=1)
bpm.metric("CA", "142 500")
bpm.button("Valider")
bpm.panel("Info", "Contenu du panneau.")
bpm.message("Message de confirmation", type="success")`;

/** Parse une ligne du type bpm.xxx("...", ...) et retourne un noeud React ou null */
function parseBpmLine(line: string, key: number): React.ReactNode {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const titleMatch = trimmed.match(/bpm\.title\s*\(\s*["']([^"']*)["']\s*(?:,\s*level\s*=\s*(\d))?\s*\)/);
  if (titleMatch) {
    const level = titleMatch[2] ? Math.min(3, Math.max(1, parseInt(titleMatch[2], 10))) : 1;
    return <Title key={key} level={level as 1 | 2 | 3}>{titleMatch[1]}</Title>;
  }

  const metricMatch = trimmed.match(/bpm\.metric\s*\(\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']\s*(?:,\s*delta\s*=\s*(-?\d+(?:\.\d+)?))?\s*(?:,\s*border\s*=\s*(True|False))?\s*\)/);
  if (metricMatch) {
    const delta = metricMatch[3] != null ? parseFloat(metricMatch[3]) : undefined;
    const border = metricMatch[4] === undefined || metricMatch[4] === "True";
    return <Metric key={key} label={metricMatch[1]} value={metricMatch[2]} delta={delta} border={border} />;
  }

  const buttonMatch = trimmed.match(/bpm\.button\s*\(\s*["']([^"']*)["']\s*\)/);
  if (buttonMatch) {
    return <Button key={key}>{buttonMatch[1]}</Button>;
  }

  const panelMatch = trimmed.match(/bpm\.panel\s*\(\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']\s*(?:,\s*variant\s*=\s*["'](\w+)["'])?\s*\)/);
  if (panelMatch) {
    const variant = (panelMatch[3] as "info" | "success" | "warning" | "error") || "info";
    return <Panel key={key} variant={variant} title={panelMatch[1]}>{panelMatch[2]}</Panel>;
  }

  const messageMatch = trimmed.match(/bpm\.message\s*\(\s*["']([^"']*)["']\s*(?:,\s*type\s*=\s*["'](\w+)["'])?\s*\)/);
  if (messageMatch) {
    const type = (messageMatch[2] as "info" | "success" | "warning" | "error") || "info";
    return <Message key={key} type={type}>{messageMatch[1]}</Message>;
  }

  const spinnerMatch = trimmed.match(/bpm\.spinner\s*\(\s*(?:text\s*=\s*["']([^"']*)["'])?\s*\)/);
  if (spinnerMatch) {
    return <Spinner key={key} size="medium" text={spinnerMatch[1] ?? ""} />;
  }

  const codeblockMatch = trimmed.match(/bpm\.codeblock\s*\(\s*["']([^"']*)["']\s*(?:,\s*language\s*=\s*["'](\w+)["'])?\s*\)/);
  if (codeblockMatch) {
    const code = codeblockMatch[1].replace(/\\n/g, "\n");
    return <CodeBlock key={key} code={code} language={(codeblockMatch[2] as "python" | "javascript") ?? "python"} />;
  }

  return null;
}

function parseCodeToPreview(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  code.split("\n").forEach((line, i) => {
    const node = parseBpmLine(line, i);
    if (node) nodes.push(node);
  });
  return nodes;
}

const SANDBOX_COMPONENTS = [
  { value: "panel", label: "bpm.panel" },
  { value: "message", label: "bpm.message" },
  { value: "button", label: "bpm.button" },
  { value: "metric", label: "bpm.metric" },
  { value: "table", label: "bpm.table" },
  { value: "tabs", label: "bpm.tabs" },
  { value: "title", label: "bpm.title" },
  { value: "spinner", label: "bpm.spinner" },
  { value: "tooltip", label: "bpm.tooltip" },
  { value: "codeblock", label: "bpm.codeblock" },
] as const;

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const component = (searchParams.get("component") || searchParams.get("c") || "panel").toLowerCase().replace("bpm.", "");
  const variant = searchParams.get("variant") || searchParams.get("v") || "info";
  const title = searchParams.get("title") || searchParams.get("t") || "";
  const value = searchParams.get("value") || "";
  const label = searchParams.get("label") || "";
  const theme = (searchParams.get("theme") || searchParams.get("th") || "light").toLowerCase();
  const isDark = theme === "dark";
  const [tableSelectedRow, setTableSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<"selector" | "code">("code");
  const [code, setCode] = useState(DEFAULT_CODE);

  const setParams = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    router.replace(`/sandbox?${p.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("theme-dark");
    else document.documentElement.classList.remove("theme-dark");
    return () => document.documentElement.classList.remove("theme-dark");
  }, [isDark]);

  const content = useMemo(() => {
    if (component === "panel") {
      return (
        <Panel variant={variant as "info" | "success" | "warning" | "error"} title={title || `Panneau ${variant}`}>
          Contenu du panneau. Variante : <strong>{variant}</strong>.
        </Panel>
      );
    }
    if (component === "message") {
      return (
        <Message type={variant as "info" | "success" | "warning" | "error"}>
          {title ? <strong>{title}</strong> : null}
          {title && <br />}
          Contenu du message.
        </Message>
      );
    }
    if (component === "button") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="small">Small</Button>
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      );
    }
    if (component === "metric") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Metric label={label || "CA"} value={value || "142 500"} delta={3200} />
          <Metric label="Taux" value="12,5 %" />
          <Metric label="Tendance" value="+3,2 %" delta={3.2} />
        </div>
      );
    }
    if (component === "table") {
      const columns = [{ key: "name", label: "Nom" }, { key: "val", label: "Valeur" }];
      const data = [{ name: "A", val: "1" }, { name: "B", val: "2" }, { name: "C", val: "3" }];
      return (
        <div style={{ padding: 16 }}>
          <Table columns={columns} data={data} onRowClick={(row) => setTableSelectedRow(row)} />
          {tableSelectedRow && (
            <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Ligne cliquée : {JSON.stringify(tableSelectedRow)}
            </p>
          )}
        </div>
      );
    }
    if (component === "tabs") {
      const tabItems = [
        { label: "Onglet 1", content: <div>Contenu onglet 1</div> },
        { label: "Onglet 2", content: <div>Contenu onglet 2</div> },
      ];
      return (
        <div style={{ padding: 16 }}>
          <Tabs tabs={tabItems} />
        </div>
      );
    }
    if (component === "title") {
      return (
        <div style={{ padding: 16 }}>
          <Title level={1}>Titre niveau 1</Title>
          <Title level={2}>Titre niveau 2</Title>
          <Title level={3}>Titre niveau 3</Title>
        </div>
      );
    }
    if (component === "spinner") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <Spinner size="small" text="" />
          <Spinner size="medium" text="Chargement…" />
        </div>
      );
    }
    if (component === "tooltip") {
      return (
        <div style={{ padding: 16 }}>
          <Tooltip text="Info-bulle au survol"><span className="underline">Survolez-moi</span></Tooltip>
        </div>
      );
    }
    if (component === "codeblock") {
      return (
        <div style={{ padding: 16 }}>
          <CodeBlock code='bpm.title("Hello")\nbpm.metric("CA", 142500)' language="python" />
        </div>
      );
    }
    return (
      <Panel variant="info" title="Sandbox BPM">
        <p>Composant : <code>{component}</code></p>
        <p>Exemples : <code>?component=panel</code>, <code>?component=metric</code>, <code>?component=button</code>, <code>?component=table</code>, <code>?component=tabs</code>, <code>?component=title</code>, <code>?component=message</code>, <code>?component=spinner</code>, <code>?component=tooltip</code>, <code>?component=codeblock</code>.</p>
        <p><code>?variant=warning</code>, <code>?title=Mon titre</code>, <code>?theme=dark</code>.</p>
      </Panel>
    );
  }, [component, variant, title, value, label, tableSelectedRow]);

  const hasVariant = component === "panel" || component === "message";
  const hasTitle = component === "panel" || component === "message";

  return (
    <div
      className={isDark ? "theme-dark" : ""}
      style={{
        minHeight: "100%",
        background: "var(--bpm-bg-secondary, #f5f5f5)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div className="doc-page w-full">
        <div className="doc-page-header">
          <h1>Sandbox</h1>
          <p className="doc-description">
            Choisissez un composant ou écrivez du code pour composer une page en direct.
          </p>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("code")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
            style={{
              background: mode === "code" ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-primary)",
              color: mode === "code" ? "#fff" : "var(--bpm-text-primary)",
              border: "1px solid var(--bpm-border)",
            }}
          >
            Par code
          </button>
          <button
            type="button"
            onClick={() => setMode("selector")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
            style={{
              background: mode === "selector" ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-primary)",
              color: mode === "selector" ? "#fff" : "var(--bpm-text-primary)",
              border: "1px solid var(--bpm-border)",
            }}
          >
            Par composant
          </button>
        </div>

        {mode === "code" && (
          <>
            <div
              className="rounded-lg border mb-4"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
              }}
            >
              <label className="block text-xs font-semibold p-3 pb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                Code (appels bpm.*)
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={DEFAULT_CODE}
                spellCheck={false}
                className="w-full p-3 pt-1 font-mono text-sm rounded-b-lg resize-y min-h-[180px] focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bpm-code-bg, #f5f5f5)",
                  borderColor: "var(--bpm-border)",
                  color: "var(--bpm-text-primary)",
                }}
                rows={10}
              />
              <p className="text-xs px-3 pb-3" style={{ color: "var(--bpm-text-secondary)" }}>
                Exemples : bpm.title(&quot;Titre&quot;, level=1), bpm.metric(&quot;CA&quot;, &quot;142 500&quot;), bpm.button(&quot;OK&quot;), bpm.panel(&quot;Titre&quot;, &quot;Contenu&quot;), bpm.message(&quot;Texte&quot;, type=&quot;success&quot;), bpm.spinner(), bpm.codeblock(&quot;code&quot;, language=&quot;python&quot;).
              </p>
            </div>
            <div
              className="rounded-lg border p-4 mb-6"
              style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
                Aperçu en direct
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {parseCodeToPreview(code).length ? (
                  parseCodeToPreview(code).map((node, i) => <React.Fragment key={i}>{node}</React.Fragment>)
                ) : (
                  <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                    Écrivez des appels bpm.* ci-dessus pour voir le rendu ici.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {mode === "selector" && (
          <>
        <div
          className="flex flex-wrap gap-4 p-4 rounded-lg border mb-6"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Composant
            </label>
            <select
              value={SANDBOX_COMPONENTS.some((c) => c.value === component) ? component : "panel"}
              onChange={(e) => setParams({ component: e.target.value })}
              className="px-3 py-2 rounded-lg border text-sm min-w-[160px]"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
                color: "var(--bpm-text-primary)",
              }}
            >
              {SANDBOX_COMPONENTS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {hasVariant && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                Variante
              </label>
              <select
                value={variant}
                onChange={(e) => setParams({ variant: e.target.value })}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{
                  background: "var(--bpm-bg-primary)",
                  borderColor: "var(--bpm-border)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                <option value="info">info</option>
                <option value="success">success</option>
                <option value="warning">warning</option>
                <option value="error">error</option>
              </select>
            </div>
          )}
          {hasTitle && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                Titre
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setParams({ title: e.target.value })}
                placeholder="Optionnel"
                className="px-3 py-2 rounded-lg border text-sm min-w-[120px]"
                style={{
                  background: "var(--bpm-bg-primary)",
                  borderColor: "var(--bpm-border)",
                  color: "var(--bpm-text-primary)",
                }}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Thème
            </label>
            <select
              value={theme}
              onChange={(e) => setParams({ theme: e.target.value })}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
                color: "var(--bpm-text-primary)",
              }}
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
        </div>
        <div className="rounded-lg border p-4" style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}>
          {content}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Sandbox BPM — Visuel d'un composant BPM (avec sidebar app).
 * Usage : /sandbox?component=panel&variant=warning&title=Test
 * Embed iframe depuis la doc statique : app.blueprint-modular.com/sandbox?component=...
 */
export default function SandboxPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bpm-bg-secondary)", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>Chargement…</div>}>
      <SandboxContent />
    </Suspense>
  );
}
