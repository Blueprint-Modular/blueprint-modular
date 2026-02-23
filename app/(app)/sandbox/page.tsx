"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMemo, useEffect } from "react";
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

function SandboxContent() {
  const searchParams = useSearchParams();
  const component = (searchParams.get("component") || searchParams.get("c") || "panel").toLowerCase().replace("bpm.", "");
  const variant = searchParams.get("variant") || searchParams.get("v") || "info";
  const title = searchParams.get("title") || searchParams.get("t") || "";
  const value = searchParams.get("value") || "";
  const label = searchParams.get("label") || "";
  const theme = (searchParams.get("theme") || searchParams.get("th") || "light").toLowerCase();
  const isDark = theme === "dark";

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
          <Table columns={columns} data={data} />
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
  }, [component, variant, title, value, label]);

  return (
    <div
      className={isDark ? "theme-dark" : ""}
      style={{
        minHeight: "100vh",
        background: "var(--bpm-bg-secondary, #f5f5f5)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>{content}</div>
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
