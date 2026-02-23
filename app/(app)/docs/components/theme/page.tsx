"use client";

import { useState } from "react";
import Link from "next/link";
import { Theme, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type ThemeVariant = "toggle" | "select";

export default function DocThemePage() {
  const [variant, setVariant] = useState<ThemeVariant>("toggle");
  const [lightLabel, setLightLabel] = useState("Clair");
  const [darkLabel, setDarkLabel] = useState("Sombre");

  const parts: string[] = [];
  if (variant !== "toggle") parts.push('variant="select"');
  if (lightLabel !== "Clair") parts.push(`light_label="${lightLabel.replace(/"/g, '\\"')}"`);
  if (darkLabel !== "Sombre") parts.push(`dark_label="${darkLabel.replace(/"/g, '\\"')}"`);
  const pythonCode = `bpm.theme(${parts.length ? parts.join(", ") : ""})`;

  const { prev, next } = getPrevNext("theme");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.theme
        </div>
        <h1>bpm.theme</h1>
        <p className="doc-description">
          Bascule entre thème clair et thème sombre. Persiste le choix dans <code>localStorage</code> (clé <code>bpm-theme</code>) et applique <code>data-theme</code> sur la racine du document.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Interaction</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Theme
            variant={variant}
            lightLabel={lightLabel}
            darkLabel={darkLabel}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as ThemeVariant)}>
              <option value="toggle">toggle</option>
              <option value="select">select</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>lightLabel</label>
            <input
              type="text"
              value={lightLabel}
              onChange={(e) => setLightLabel(e.target.value)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>darkLabel</label>
            <input
              type="text"
              value={darkLabel}
              onChange={(e) => setDarkLabel(e.target.value)}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              Copier
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Props (React)</h2>
      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>variant</code></td>
            <td><code>toggle | select</code></td>
            <td>toggle</td>
            <td>Interrupteur (toggle) ou liste déroulante (select).</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Label à côté du toggle (variant toggle). Si absent, affiche le libellé du thème actuel.</td>
          </tr>
          <tr>
            <td><code>lightLabel</code></td>
            <td><code>string</code></td>
            <td>Clair</td>
            <td>Libellé de l’option clair.</td>
          </tr>
          <tr>
            <td><code>darkLabel</code></td>
            <td><code>string</code></td>
            <td>Sombre</td>
            <td>Libellé de l’option sombre.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Intégration</h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)" }}>
        Le composant utilise le <code>ThemeProvider</code> de l’app lorsqu’il est monté ; sinon il lit et écrit <code>data-theme</code> et <code>localStorage</code> directement. Les variables CSS BPM (<code>--bpm-bg-primary</code>, etc.) sont définies dans <code>globals.css</code> pour <code>[data-theme=&quot;dark&quot;]</code>.
      </p>
      <CodeBlock code={'# Toggle (défaut)\nbpm.theme()\n\n# Liste déroulante\nbpm.theme(variant="select", light_label="Clair", dark_label="Sombre")'} language="python" />

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          Tester en direct dans le sandbox :
        </p>
        <Link href="/sandbox?component=theme" className="doc-cta inline-block">
          Ouvrir dans le sandbox
        </Link>
      </div>

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
