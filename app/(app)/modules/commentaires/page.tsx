"use client";

import Link from "next/link";
import { Tabs, CodeBlock } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Commentaires</strong> permet d&apos;ajouter des commentaires et annotations sur une entité (document, ligne, projet). Fil de discussion avec auteur, date, types (commentaire / annotation / décision / blocage) et résolution.
    </p>
    <CodeBlock code={'# bpm — afficher les commentaires d\'un document\nbpm.title("Commentaires")\n# Conteneur : fil de commentaires + zone "Nouveau commentaire" (textarea + Envoyer)'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Aperçu du fil. Pour tester les avatars, types, résolution et actions, ouvrez le simulateur.</p>
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        <h3 className="text-sm font-semibold m-0 mb-3" style={{ color: "var(--bpm-text-primary)" }}>Commentaires (2)</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-2 rounded-lg" style={{ background: "var(--bpm-sidebar-bg)" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "var(--bpm-accent-cyan)", color: "#fff" }}>AM</span>
            <div>
              <strong style={{ color: "var(--bpm-text-primary)" }}>Alice Martin</strong>
              <span className="ml-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>20 févr. à 09h00</span>
              <p className="m-0 mt-1" style={{ color: "var(--bpm-text-primary)" }}>Bonne avancée sur le livrable.</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 rounded-lg" style={{ background: "var(--bpm-sidebar-bg)" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "#e67e22", color: "#fff" }}>BL</span>
            <div>
              <strong style={{ color: "var(--bpm-text-primary)" }}>Bob Leroy</strong>
              <span className="ml-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>20 févr. à 10h15</span>
              <p className="m-0 mt-1" style={{ color: "var(--bpm-text-primary)" }}>Merci, je finalise la doc.</p>
            </div>
          </div>
        </div>
        <div className="border-t pt-3 mt-3" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Nouveau commentaire</p>
          <p className="text-xs m-0" style={{ color: "var(--bpm-text-secondary)" }}>Zone de saisie + bouton Envoyer (simulateur complet).</p>
        </div>
      </div>
    </>
  );
}

export default function CommentairesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Commentaires</div>
        <h1>Commentaires</h1>
        <p className="doc-description">Commentaires et annotations sur une entité. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/commentaires/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
