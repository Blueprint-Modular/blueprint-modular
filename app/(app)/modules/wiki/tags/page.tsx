"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Panel, Button } from "@/components/bpm";

const TAG_CLOUD_COLORS = [
  "var(--bpm-accent-cyan)",
  "var(--bpm-text-primary)",
  "var(--bpm-accent)",
  "var(--bpm-text-secondary)",
];

export default function WikiTagsPage() {
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"cloud" | "list">("cloud");

  useEffect(() => {
    fetch("/api/wiki/tags", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  const maxCount = tags.length ? Math.max(...tags.map((t) => t.count)) : 1;
  const sortedByAlpha = [...tags].sort((a, b) => a.tag.localeCompare(b.tag, "fr"));

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/wiki">Wiki</Link> → Tags
        </div>
        <h1>Tags du Wiki</h1>
        <p className="doc-description">
          Nuage de tags ou liste alphabétique avec nombre d&apos;articles. Cliquez sur un tag pour filtrer la liste.
        </p>
        {tags.length > 0 && (
          <div className="flex gap-2 mt-2" role="group" aria-label="Vue d’affichage">
            <Button
              type="button"
              variant={view === "cloud" ? "primary" : "outline"}
              size="small"
              onClick={() => setView("cloud")}
              aria-pressed={view === "cloud"}
            >
              Nuage
            </Button>
            <Button
              type="button"
              variant={view === "list" ? "primary" : "outline"}
              size="small"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              Liste A–Z
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>
      ) : tags.length === 0 ? (
        <Panel variant="info" title="Aucun tag">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucun article n&apos;a encore de tag. Ajoutez des tags lors de l&apos;édition des articles.
          </p>
          <Link href="/modules/wiki" className="inline-block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            Retour au Wiki
          </Link>
        </Panel>
      ) : view === "cloud" ? (
        <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>Nuage de tags</h2>
          <div className="flex flex-wrap gap-3 items-baseline">
            {tags.map(({ tag, count }, i) => {
              const scale = maxCount > 0 ? 0.875 + (count / maxCount) * 0.75 : 1;
              const color = TAG_CLOUD_COLORS[i % TAG_CLOUD_COLORS.length];
              return (
                <Link
                  key={tag}
                  href={`/modules/wiki?tag=${encodeURIComponent(tag)}`}
                  className="inline-block px-2 py-1 rounded hover:opacity-90 transition-opacity"
                  style={{
                    background: "var(--bpm-bg-primary)",
                    color,
                    fontSize: `${Math.min(scale, 1.5)}rem`,
                    border: "1px solid var(--bpm-border)",
                  }}
                >
                  {tag} <span className="opacity-70">({count})</span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs mt-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Cliquez sur un tag pour afficher les articles associés.
          </p>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>Liste alphabétique</h2>
          <ul className="space-y-1">
            {sortedByAlpha.map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  href={`/modules/wiki?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center justify-between w-full sm:w-auto sm:min-w-[200px] px-3 py-2 rounded hover:opacity-90"
                  style={{ color: "var(--bpm-accent-cyan)", background: "var(--bpm-bg-primary)", border: "1px solid var(--bpm-border)" }}
                >
                  <span>{tag}</span>
                  <span className="text-sm opacity-70" style={{ color: "var(--bpm-text-secondary)" }}>{count} article{count > 1 ? "s" : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/wiki" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au Wiki</Link>
        <Link href="/modules/wiki/search" style={{ color: "var(--bpm-accent-cyan)" }}>Recherche</Link>
      </nav>
    </div>
  );
}
