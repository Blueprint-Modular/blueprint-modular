"use client";

import Link from "next/link";
import { Tabs, CodeBlock } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Tableau blanc</strong> fournit des post-it par colonnes (Bien / À améliorer / Action) pour rétrospectives ou ateliers. Auteur, date, actions (éditer, supprimer, déplacer). Contenu en local ou via API.
    </p>
    <CodeBlock code={'# bpm — tableau blanc : post-it par colonnes\nbpm.title("Rétro")\n# Conteneur épuré (sans bpm.panel) : zone idées + colonnes + formulaire'} language="python" />
  </>
);

function SimuContent() {
  const cols = [
    { id: "bien", label: "Bien", color: "#166534", bg: "rgba(34,197,94,0.15)" },
    { id: "ameliorer", label: "À améliorer", color: "#b45309", bg: "rgba(251,146,60,0.2)" },
    { id: "action", label: "Action", color: "#1e40af", bg: "rgba(59,130,246,0.15)" },
  ];
  const samples = [
    { content: "Livraison à l'heure", column: "bien" },
    { content: "Tests à renforcer", column: "ameliorer" },
    { content: "Doc API", column: "action" },
  ];
  return (
    <>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Aperçu des 3 colonnes. Pour éditer, supprimer, déplacer et ajouter des post-it, ouvrez le simulateur.</p>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
        <div className="px-4 py-2 border-b text-sm font-semibold" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)", color: "var(--bpm-text-primary)" }}>
          Zone idées (3 post-it)
        </div>
        <div className="p-4 grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {cols.map((col) => (
            <div key={col.id} className="rounded-lg border min-h-[100px]" style={{ borderColor: col.color + "44", background: col.bg }}>
              <div className="px-3 py-2 rounded-t-lg font-semibold text-sm text-center" style={{ background: col.color, color: "#fff" }}>{col.label}</div>
              <div className="p-2 space-y-2">
                {samples.filter((s) => s.column === col.id).map((s, i) => (
                  <div key={i} className="p-2 rounded border text-sm min-h-[48px]" style={{ background: "#fefce8", borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>{s.content}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t text-xs" style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}>
          Nouveau post-it : zone de saisie + sélecteur de colonne + bouton Ajouter (simulateur complet).
        </div>
      </div>
    </>
  );
}

export default function TableauBlancModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Tableau blanc</div>
        <h1>Tableau blanc</h1>
        <p className="doc-description">Post-it et zones de texte pour rétros ou ateliers. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/tableau-blanc/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
