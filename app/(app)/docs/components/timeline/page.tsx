"use client";

import Link from "next/link";
import { Timeline, CodeBlock } from "@/components/bpm";
import type { TimelineItem } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const items: TimelineItem[] = [
  { title: "Étape 1", description: "Première étape", date: "Jan 2025", status: "done" },
  { title: "Étape 2", description: "En cours", date: "Fév 2025", status: "current" },
  { title: "Étape 3", description: "À venir", date: "Mar 2025", status: "upcoming" },
];

export default function DocTimelinePage() {
  const { prev, next } = getPrevNext("timeline");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.timeline</div>
        <h1>bpm.timeline</h1>
        <p className="doc-description">Frise chronologique verticale : étapes avec titre, description, date et statut (done, current, upcoming).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>
      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Timeline items={items} />
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText("bpm.timeline(items=[...])")}>Copier</button></div>
          <pre><code>{"bpm.timeline(items=[{\"title\": \"Étape 1\", \"date\": \"Jan 2025\", \"status\": \"done\"}, ...])"}</code></pre>
        </div>
      </div>
      <h2 className="text-lg font-semibold mt-8 mb-2">Props</h2>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>events</code></td><td><code>TimelineEvent[]</code></td><td>—</td><td>Non</td><td>Fil chronologique (date ISO, title, actor?, metadata?, groupByDate, maxItems, sortOrder).</td></tr>
          <tr><td><code>items</code></td><td><code>TimelineItem[]</code></td><td>[]</td><td>Non</td><td>Ancienne API (title, description?, date?, status?).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>
      <h3 className="text-base font-semibold mt-6 mb-2">TimelineItem</h3>
      <table className="props-table">
        <thead><tr><th>Propriété</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>id</code></td><td><code>string</code></td><td>Identifiant unique (optionnel).</td></tr>
          <tr><td><code>title</code></td><td><code>ReactNode</code></td><td>Titre de l&apos;étape.</td></tr>
          <tr><td><code>description</code></td><td><code>ReactNode</code></td><td>Description ou sous-texte (optionnel).</td></tr>
          <tr><td><code>date</code></td><td><code>string</code></td><td>Date affichée (ex. &quot;Jan 2025&quot;) (optionnel).</td></tr>
          <tr><td><code>status</code></td><td><code>&quot;done&quot; | &quot;current&quot; | &quot;upcoming&quot;</code></td><td>État visuel : terminé, en cours, à venir.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.timeline(items=[{"title": "Inscription", "date": "Jan 2025", "status": "done"}, {"title": "Validation", "status": "current"}])'} language="python" />
      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
