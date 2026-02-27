export default function DocsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--bpm-accent)" }}>
        Documentation
      </h1>
      <p style={{ color: "var(--bpm-text-secondary)" }}>
        Guide d&apos;utilisation et référence des composants BPM.
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Prérequis production</strong> : structures de base de données (tables Prisma par module), variables d&apos;environnement et déploiement — voir <code>docs/DATABASE.md</code> dans le dépôt (et <a href="https://github.com/remigit55/blueprint-modular/blob/master/docs/DATABASE.md" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>en ligne</a>).
      </p>
    </div>
  );
}
