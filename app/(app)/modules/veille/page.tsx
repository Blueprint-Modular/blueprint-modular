import Link from "next/link";

export default function VeilleModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Module Veille</div>
        <h1>Module Veille</h1>
        <p className="doc-description">
          Monitoring et veille : suivi des sources, alertes et flux d&apos;information.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Module</span>
          <span className="doc-reading-time">⏱ 1 min</span>
        </div>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Ce module est prévu pour centraliser la veille (RSS, alertes, tableaux de bord). L&apos;interface détaillée sera enrichie dans une prochaine version.
      </p>
    </div>
  );
}
