"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", icon: "dashboard" },
  { key: "inventory", label: "Inventaire", icon: "inventory_2" },
  { key: "settings", label: "Paramètres", icon: "settings" },
];

export default function DocPageLayoutPage() {
  const [title, setTitle] = useState("Mon app");
  const [currentItem, setCurrentItem] = useState("dashboard");
  const [defaultCollapsed, setDefaultCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const pyTitle = title.replace(/"/g, '\\"');
  const pyDefaultCollapsed = defaultCollapsed ? ", defaultCollapsed=True" : "";
  const pythonCode = `bpm.pageLayout(title="${pyTitle}", items=[...], currentItem="${currentItem}", onNavigate=...)${pyDefaultCollapsed}`;
  const { prev, next } = getPrevNext("pagelayout");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.pageLayout</div>
        <h1>bpm.pageLayout</h1>
        <p className="doc-description">Layout avec sidebar repliable, titre et zone de contenu.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 320 }}>
          <PageLayout
            title={title}
            items={SIDEBAR_ITEMS}
            currentItem={currentItem}
            onNavigate={setCurrentItem}
            defaultCollapsed={defaultCollapsed}
            theme={theme}
            onThemeChange={setTheme}
          >
            <p style={{ margin: 0 }}>Contenu de la page : <strong>{currentItem}</strong></p>
          </PageLayout>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>currentItem</label>
            <select value={currentItem} onChange={(e) => setCurrentItem(e.target.value)}>
              {SIDEBAR_ITEMS.map((i) => (
                <option key={i.key} value={i.key}>{i.label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>defaultCollapsed</label>
            <select value={defaultCollapsed ? "true" : "false"} onChange={(e) => setDefaultCollapsed(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Titre affiché en haut de la sidebar.</td></tr>
          <tr><td><code>items</code></td><td><code>SidebarItem[]</code></td><td>—</td><td>Oui</td><td>Entrées du menu (key, label, icon).</td></tr>
          <tr><td><code>currentItem</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Clé de l&apos;entrée active.</td></tr>
          <tr><td><code>onNavigate</code></td><td><code>(key: string) =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback à la sélection d&apos;une entrée.</td></tr>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Contenu principal.</td></tr>
          <tr><td><code>defaultCollapsed</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Sidebar repliée par défaut.</td></tr>
          <tr><td><code>theme</code></td><td><code>&quot;light&quot; | &quot;dark&quot;</code></td><td>—</td><td>Non</td><td>Thème courant (affiche bouton thème si onThemeChange fourni).</td></tr>
          <tr><td><code>onThemeChange</code></td><td><code>(theme: &quot;light&quot; | &quot;dark&quot;) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback changement de thème.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.pageLayout(title="App", items=[{"key": "home", "label": "Accueil", "icon": "home"}], currentItem="home", onNavigate=handler)'} language="python" />
      <CodeBlock code={'bpm.pageLayout(title="Admin", items=sidebar_items, currentItem=current, onNavigate=set_current, defaultCollapsed=True)'} language="python" />
      <CodeBlock code={'bpm.pageLayout(..., theme="dark", onThemeChange=set_theme)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
