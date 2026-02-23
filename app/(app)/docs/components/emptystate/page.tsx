"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocEmptyStatePage() {
  const [title, setTitle] = useState("Aucune donnée");
  const [description, setDescription] = useState("Ajoutez des éléments pour commencer.");
  const [actionLabel, setActionLabel] = useState("");

  const parts: string[] = [];
  if (title !== "Aucune donnée") parts.push(`title="${title.replace(/"/g, '\\"')}"`);
  if (description.trim() !== "") parts.push(`description="${description.trim().replace(/"/g, '\\"')}"`);
  if (actionLabel.trim() !== "") parts.push(`action_label="${actionLabel.trim().replace(/"/g, '\\"')}"`);
  const pythonCode = parts.length ? `bpm.emptystate(${parts.join(", ")})` : "bpm.emptystate()";
  const { prev, next } = getPrevNext("emptystate");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.emptystate
        </div>
        <h1>bpm.emptystate</h1>
        <p className="doc-description">
          État vide pour signaler l&apos;absence de données, avec titre, description et bouton d&apos;action optionnel.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <EmptyState
              title={title}
              description={description.trim() || undefined}
              action={
                actionLabel.trim() ? (
                  <Button variant="primary" onClick={() => {}}>
                    {actionLabel.trim()}
                  </Button>
                ) : undefined
              }
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Aucune donnée"
            />
          </div>
          <div className="sandbox-control-group">
            <label>description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle"
            />
          </div>
          <div className="sandbox-control-group">
            <label>action_label</label>
            <input
              type="text"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              placeholder="ex. Ajouter un élément"
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
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>Aucune donnée</td>
            <td>Non</td>
            <td>Titre principal de l&apos;état vide.</td>
          </tr>
          <tr>
            <td><code>description</code></td>
            <td><code>string | ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Texte ou contenu sous le titre (Python : chaîne uniquement).</td>
          </tr>
          <tr>
            <td><code>icon</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Icône au-dessus du titre (React uniquement).</td>
          </tr>
          <tr>
            <td><code>action</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Bouton ou lien d&apos;action (Python : utiliser <code>action_label</code>).</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Classes CSS additionnelles.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code="bpm.emptystate()" language="python" />
      <CodeBlock code={'bpm.emptystate(title="Aucun résultat", description="Essayez de modifier vos filtres.")'} language="python" />
      <CodeBlock code={'bpm.emptystate(title="Liste vide", description="Ajoutez un premier élément.", action_label="Créer")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
