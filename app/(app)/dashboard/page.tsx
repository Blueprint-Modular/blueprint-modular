import Link from "next/link";
import { Boxes, FolderOpen, Sparkles } from "lucide-react";
import { SandboxIcon } from "@/components/icons/SandboxIcon";
import { StartBuildingBlock } from "@/components/StartBuildingBlock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Tableau de bord Blueprint Modular — installez le package Python BPM et accédez à vos composants, modules et sandbox en un clic.",
};

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
    description: "Tester les composants en direct ou écrire du code bpm.* pour créer une page",
    icon: SandboxIcon,
  },
  {
    href: "/modules",
    label: "Modules",
    description: "Wiki, IA, Documents, Veille — modules prêts à l'emploi",
    icon: FolderOpen,
  },
];

export default function DashboardPage() {
  return (
    <div className="doc-page" data-page-description="Tableau de bord Blueprint Modular — installation du package Python BPM, accès aux composants, modules et sandbox.">
      <StartBuildingBlock />

      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)", marginTop: "5rem" }}>
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
    </div>
  );
}
