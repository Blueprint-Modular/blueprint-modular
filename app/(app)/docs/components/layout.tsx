import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Composants",
  description:
    "Référence complète des composants BPM : métriques, tableaux, boutons, graphiques et plus de 50 briques Python/React pour vos interfaces métier.",
};

export default function DocsComponentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
