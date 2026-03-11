"use client";

import Link from "next/link";
import { CrudPage, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const CRUD_COLUMNS = [
  { key: "name", label: "Nom", type: "text" as const },
  { key: "email", label: "Email", type: "text" as const },
];
const CRUD_FIELDS = [
  { key: "name", label: "Nom", type: "text" as const },
  { key: "email", label: "Email", type: "text" as const },
];

export default function DocCrudPage() {
  const pythonCode = `bpm.crud(title="Produits", endpoint="/api/products", columns=cols, fields=fields)`;
  const { prev, next } = getPrevNext("crud");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.crud</div>
        <h1>bpm.crud</h1>
        <p className="doc-description">Page CRUD (liste, formulaire, colonnes, champs, endpoint).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Utilitaires</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 320 }}>
          <CrudPage
            title="Utilisateurs (démo)"
            endpoint="https://jsonplaceholder.typicode.com/users"
            columns={CRUD_COLUMNS}
            fields={CRUD_FIELDS}
            idKey="id"
          />
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
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Titre de la page.</td></tr>
          <tr><td><code>endpoint</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>URL de l&apos;API (GET liste, POST création, PUT/DELETE par id).</td></tr>
          <tr><td><code>columns</code></td><td><code>CrudColumn[]</code></td><td>—</td><td>Oui</td><td>Colonnes du tableau (key, label, type?, sortable?).</td></tr>
          <tr><td><code>fields</code></td><td><code>CrudField[]</code></td><td>—</td><td>Oui</td><td>Champs du formulaire (key, label, type, required?, options?).</td></tr>
          <tr><td><code>domain</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Domaine optionnel.</td></tr>
          <tr><td><code>semantic</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Sémantique optionnelle.</td></tr>
          <tr><td><code>idKey</code></td><td><code>string</code></td><td>id</td><td>Non</td><td>Champ utilisé comme identifiant pour GET/PUT/DELETE.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'cols = [{"key": "name", "label": "Nom", "type": "text"}, {"key": "price", "label": "Prix", "type": "number"}]\nfields = [{"key": "name", "label": "Nom", "type": "text", "required": True}, {"key": "price", "label": "Prix", "type": "number"}]\nbpm.crud(title="Produits", endpoint="/api/products", columns=cols, fields=fields)'} language="python" />
      <CodeBlock code={'bpm.crud(title="Utilisateurs", endpoint="/api/users", columns=cols, fields=fields, idKey="uuid")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
