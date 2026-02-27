import Link from "next/link";

const ENTRIES = [
  {
    version: "0.1.21",
    date: "2025-02-26",
    items: [
      "Module Gestion de parc : refonte UX (cartes métriques, onglets, filtres chips, empty state, tableaux avec badges)",
      "Cohérence gris : Calendrier, Keep screen on, Commentaires et Tableau blanc alignés sur la sidebar",
      "Version : source unique package.json, npm run version:sync, footer app dynamique",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-02-22",
    items: ["Première version Next.js 14", "Auth Google, thème dark/light", "Sidebar, design system BPM", "Pages doc composants (metric, button, panel)", "Getting Started wizard", "API Wiki, health"],
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl">
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/docs">Docs</Link>
        <span className="mx-2">/</span>
        <span>Changelog</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--bpm-accent)" }}>
        Changelog
      </h1>
      <div className="space-y-6">
        {ENTRIES.map((e) => (
          <article
            key={e.version}
            className="pb-6 border-b"
            style={{ borderColor: "var(--bpm-border)" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold" style={{ color: "var(--bpm-accent)" }}>
                v{e.version}
              </span>
              <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {e.date}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1" style={{ color: "var(--bpm-text-primary)" }}>
              {e.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/docs" className="underline">
          Retour à la documentation
        </Link>
      </p>
    </div>
  );
}
