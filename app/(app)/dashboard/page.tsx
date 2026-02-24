import Link from "next/link";
import { Boxes, FolderOpen, Settings, ExternalLink, Sparkles } from "lucide-react";
import { SandboxIcon } from "@/components/icons/SandboxIcon";
import { StartBuildingBlock } from "@/components/StartBuildingBlock";

const quickLinks = [
  {
    href: "/settings/wizard",
    label: "Assistant de configuration",
    description: "Paramétrer l'app en quelques étapes : thème, couleur, clés API, notifications",
    icon: Sparkles,
  },
  {
    href: "/docs/components",
    label: "Composants",
    description: "Catalogue et référence des composants BPM (boutons, métriques, tableaux, etc.)",
    icon: Boxes,
  },
  {
    href: "/sandbox",
    label: "Sandbox",
    description: "Tester les composants en direct ou écrire du code bpm.* pour composer une page",
    icon: SandboxIcon,
  },
  {
    href: "/modules",
    label: "Modules",
    description: "Wiki, IA, Documents, Veille — modules prêts à l'emploi",
    icon: FolderOpen,
  },
  {
    href: "/settings",
    label: "Paramètres",
    description: "Thème, clés API, notifications et préférences",
    icon: Settings,
  },
];

const resources = [
  { href: "https://docs.blueprint-modular.com/", label: "Documentation", external: true },
  { href: "https://pypi.org/project/blueprint-modular/", label: "PyPI — blueprint-modular", external: true },
];

export default function DashboardPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>Accueil</h1>
        <p className="doc-description">
          Bienvenue sur Blueprint Modular. Accédez rapidement à la documentation, à la sandbox et aux modules.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Tableau de bord</span>
        </div>
      </div>

      <StartBuildingBlock />

      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
        Accès rapide
      </h2>
      <div
        className="grid gap-4 mb-10"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}
      >
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block p-4 rounded-xl border transition hover:border-[var(--bpm-accent-cyan)] hover:shadow-md"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-accent-cyan)" }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
                  {item.label}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)", marginLeft: "52px" }}>
                {item.description}
              </p>
              <span
                className="inline-block mt-2 text-sm font-medium"
                style={{ color: "var(--bpm-accent-cyan)", marginLeft: "52px" }}
              >
                Ouvrir →
              </span>
            </Link>
          );
        })}
      </div>

      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
        Ressources
      </h2>
      <ul className="list-none p-0 m-0 space-y-2">
        {resources.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-sm transition hover:underline"
              style={{ color: "var(--bpm-accent-cyan)" }}
            >
              {item.external && <ExternalLink className="w-4 h-4 shrink-0" />}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
