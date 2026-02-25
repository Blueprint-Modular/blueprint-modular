"use client";

import { useState } from "react";
import Link from "next/link";
import { Pagination, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocPaginationPage() {
  const [page, setPage] = useState(1);
  const totalPages = 5;
  const { prev, next } = getPrevNext("pagination");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.pagination
        </div>
        <h1>bpm.pagination</h1>
        <p className="doc-description">
          Pagination pour listes et tableaux : page courante, total de pages, callback au changement.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={10}
            totalItems={50}
            label="Page"
          />
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(`bpm.pagination(page=${page}, total_pages=${totalPages}, on_page_change=...)`)}>
              Copier
            </button>
          </div>
          <pre><code>{`bpm.pagination(page=${page}, total_pages=${totalPages}, on_page_change=...)`}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Props</h2>
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
            <td><code>page</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Page courante (1-based).</td>
          </tr>
          <tr>
            <td><code>totalPages</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Nombre total de pages.</td>
          </tr>
          <tr>
            <td><code>onPageChange</code></td>
            <td><code>(page: number) =&gt; void</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Callback au changement de page.</td>
          </tr>
          <tr>
            <td><code>pageSize</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Taille de page (affichage optionnel).</td>
          </tr>
          <tr>
            <td><code>totalItems</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Nombre total d&apos;éléments.</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Libellé optionnel (ex. &quot;Page 1 sur 5&quot;).</td>
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
      <CodeBlock code={'bpm.pagination(page=1, total_pages=10, on_page_change=handle_page)'} language="python" />
      <CodeBlock code={'bpm.pagination(page=3, total_pages=5, page_size=20, total_items=97, label="Page")'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
