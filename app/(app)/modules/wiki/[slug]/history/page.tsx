"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Panel, Button } from "@/components/bpm";

type Revision = {
  id: string;
  content: string;
  authorId?: string;
  authorName: string | null;
  changeNote: string | null;
  createdAt: string;
};

export default function WikiHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session, status } = useSession();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [restoreRevId, setRestoreRevId] = useState<string | null>(null);
  const [restoreNote, setRestoreNote] = useState("");
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!slug || status === "loading") return;
    fetch(`/api/wiki/${encodeURIComponent(slug)}/revisions`, { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          setError("Connectez-vous pour voir l'historique.");
          return [];
        }
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setRevisions(Array.isArray(data) ? data : []))
      .catch(() => setError("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, [slug, status]);

  const selected = revisions.find((r) => r.id === selectedId);
  const compare = compareId ? revisions.find((r) => r.id === compareId) : null;
  const selectedIndex = selectedId ? revisions.findIndex((r) => r.id === selectedId) : -1;
  const previousRevision = selectedIndex >= 0 && selectedIndex < revisions.length - 1 ? revisions[selectedIndex + 1] : null;

  function diffLines(oldContent: string, newContent: string): { type: "add" | "remove" | "unchanged"; text: string }[] {
    const oldLines = oldContent.split("\n");
    const newLines = newContent.split("\n");
    const result: { type: "add" | "remove" | "unchanged"; text: string }[] = [];
    let i = 0;
    let j = 0;
    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        result.push({ type: "unchanged", text: oldLines[i] ?? "" });
        i++;
        j++;
      } else if (j < newLines.length && (i >= oldLines.length || !oldLines.slice(i).includes(newLines[j]!))) {
        result.push({ type: "add", text: newLines[j] ?? "" });
        j++;
      } else if (i < oldLines.length && (j >= newLines.length || !newLines.slice(j).includes(oldLines[i]!))) {
        result.push({ type: "remove", text: oldLines[i] ?? "" });
        i++;
      } else {
        result.push({ type: "add", text: newLines[j] ?? "" });
        j++;
      }
    }
    return result;
  }

  const handleRestore = async () => {
    if (!restoreRevId || !slug) return;
    setRestoring(true);
    setError(null);
    try {
      const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId: restoreRevId }),
        credentials: "include",
      });
      if (res.ok) router.push(`/modules/wiki/${slug}`);
      else setError("Impossible de restaurer cette version.");
    } catch {
      setError("Impossible de restaurer.");
    } finally {
      setRestoring(false);
      setRestoreRevId(null);
      setRestoreNote("");
    }
  };

  if (loading) return <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>;
  if (error) {
    return (
      <Panel variant="error" title="Erreur">
        {error}
        <Link href={`/modules/wiki/${slug}`} className="block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>Retour à l&apos;article</Link>
      </Panel>
    );
  }

  return (
    <div className="doc-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Historique des révisions
        </h1>
        <Link href={`/modules/wiki/${slug}`}>
          <Button variant="outline" size="small">← Retour à l&apos;article</Button>
        </Link>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Cliquez sur une révision pour afficher son contenu. Les 50 dernières révisions sont conservées.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel variant="info" title="Révisions (plus récente en haut)">
          <ul className="space-y-2 max-h-[400px] overflow-y-auto bpm-timeline-vertical">
            {revisions.map((r) => (
              <li key={r.id} className="text-sm flex flex-wrap items-center gap-2 py-2 border-b border-[var(--bpm-border)] last:border-b-0">
                <span className="font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                  {new Date(r.createdAt).toLocaleString("fr-FR")}
                </span>
                {r.authorName && <span className="opacity-80" style={{ color: "var(--bpm-text-secondary)" }}>· {r.authorName}</span>}
                {r.changeNote && <span className="block w-full truncate text-xs mt-0.5 opacity-70" style={{ color: "var(--bpm-text-secondary)" }}>{r.changeNote}</span>}
                <div className="flex gap-1 mt-1 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                  >
                    Voir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={() => setRestoreRevId(r.id)}
                  >
                    Restaurer
                  </Button>
                  <button
                    type="button"
                    className="text-xs px-2 py-0.5 rounded hover:opacity-90"
                    style={{ background: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}
                    onClick={() => setCompareId(compareId === r.id ? null : r.id)}
                  >
                    {compareId === r.id ? "Désélectionner" : "Comparer"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {revisions.length === 0 && (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune révision enregistrée.</p>
          )}
        </Panel>

        <div className="space-y-4">
          {selected && (
            <Panel variant="info" title={`Révision du ${new Date(selected.createdAt).toLocaleString("fr-FR")}`}>
              {previousRevision && (
                <p className="text-xs mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Diff vs version précédente</p>
              )}
              {previousRevision ? (
                <div className="text-xs space-y-0 font-mono max-h-[300px] overflow-y-auto rounded border p-2" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
                  {diffLines(previousRevision.content, selected.content).map((line, i) => (
                    <div
                      key={i}
                      className="px-2 py-0.5"
                      style={{
                        background: line.type === "add" ? "rgba(69,208,158,0.2)" : line.type === "remove" ? "rgba(239,68,68,0.15)" : "transparent",
                        color: line.type === "remove" ? "var(--bpm-text-secondary)" : "var(--bpm-text-primary)",
                        textDecoration: line.type === "remove" ? "line-through" : undefined,
                      }}
                    >
                      {line.type === "add" ? "+ " : line.type === "remove" ? "- " : "  "}
                      {line.text || " "}
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-[300px] overflow-y-auto p-2 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
                  {selected.content}
                </pre>
              )}
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" size="small" onClick={() => setRestoreRevId(selected.id)}>
                  Restaurer cette version
                </Button>
              </div>
            </Panel>
          )}
          {selected && compare && selected.id !== compare.id && (
            <Panel variant="info" title="Comparaison : Version A (ancienne) vs Version B (récente)">
              <p className="text-xs mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Version A : {new Date(compare.createdAt).toLocaleString("fr-FR")} · Version B : {new Date(selected.createdAt).toLocaleString("fr-FR")}</p>
              <div className="text-xs space-y-0 font-mono max-h-[300px] overflow-y-auto rounded border p-2" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
                {diffLines(compare.content, selected.content).map((line, i) => (
                  <div
                    key={i}
                    className="px-2 py-0.5"
                    style={{
                      background: line.type === "add" ? "rgba(69,208,158,0.2)" : line.type === "remove" ? "rgba(239,68,68,0.15)" : "transparent",
                      color: line.type === "remove" ? "var(--bpm-text-secondary)" : "var(--bpm-text-primary)",
                      textDecoration: line.type === "remove" ? "line-through" : undefined,
                    }}
                  >
                    {line.type === "add" ? "+ " : line.type === "remove" ? "- " : "  "}
                    {line.text || " "}
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {restoreRevId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="restore-dialog-title"
        >
          <Panel variant="info" title="Restaurer cette version ?" className="max-w-md w-full">
            <p id="restore-dialog-title" className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
              Le contenu actuel de l&apos;article sera remplacé par cette révision. Vous pourrez modifier la note de changement ci-dessous.
            </p>
            <label className="block mb-4">
              <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Note de changement (optionnel)</span>
              <input
                type="text"
                value={restoreNote}
                onChange={(e) => setRestoreNote(e.target.value)}
                placeholder="Ex : Restauration de la version du …"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </label>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="small" onClick={() => { setRestoreRevId(null); setRestoreNote(""); }} disabled={restoring}>
                Annuler
              </Button>
              <Button type="button" size="small" onClick={handleRestore} disabled={restoring}>
                {restoring ? "Restauration…" : "Restaurer"}
              </Button>
            </div>
          </Panel>
        </div>
      )}

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/wiki/${slug}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Retour à l&apos;article</Link>
        <Link href={`/modules/wiki/${slug}/edit`} style={{ color: "var(--bpm-accent-cyan)" }}>Modifier</Link>
      </nav>
    </div>
  );
}
