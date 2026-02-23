"use client";

import Link from "next/link";
import { Metric, Button, Panel, Table, Tabs, Title, Toggle, Message, Spinner, Tooltip, Selectbox, NumberInput, Expander, Modal, CodeBlock } from "@/components/bpm";

const CATEGORIES: { name: string; items: { slug: string; name: string; description: string; preview: React.ReactNode }[] }[] = [
  {
    name: "Affichage de données",
    items: [
      { slug: "metric", name: "bpm.metric", description: "Métrique avec valeur, label et delta.", preview: <Metric value={142500} label="CA" delta={3200} /> },
      { slug: "table", name: "bpm.table", description: "Tableau triable avec lignes alternées.", preview: <Table columns={[{ key: "A", label: "A" }, { key: "B", label: "B" }]} data={[{ A: "1", B: "2" }]} /> },
      { slug: "title", name: "bpm.title", description: "Titre niveaux 1 à 4.", preview: <Title level={2}>Titre</Title> },
    ],
  },
  {
    name: "Mise en page",
    items: [
      { slug: "panel", name: "bpm.panel", description: "Panneau informatif (info, success, warning, error).", preview: <Panel variant="info" title="Info">Contenu</Panel> },
      { slug: "tabs", name: "bpm.tabs", description: "Onglets pour organiser le contenu.", preview: <Tabs tabs={[{ label: "Onglet 1", content: null }, { label: "Onglet 2", content: null }]} /> },
      { slug: "expander", name: "bpm.expander", description: "Bloc repliable.", preview: <Expander title="Détails">Contenu</Expander> },
    ],
  },
  {
    name: "Interaction",
    items: [
      { slug: "button", name: "bpm.button", description: "Bouton d'action (primary, secondary, outline).", preview: <Button>Action</Button> },
      { slug: "toggle", name: "bpm.toggle", description: "Interrupteur on/off.", preview: <Toggle value={false} onChange={() => {}} label="Option" /> },
      { slug: "selectbox", name: "bpm.selectbox", description: "Liste déroulante.", preview: <Selectbox options={[{ value: "a", label: "Option A" }]} value={null} onChange={() => {}} placeholder="Choisir" /> },
      { slug: "numberinput", name: "bpm.numberinput", description: "Champ numérique min/max/step.", preview: <NumberInput value={10} onChange={() => {}} label="Quantité" /> },
    ],
  },
  {
    name: "Feedback",
    items: [
      { slug: "message", name: "bpm.message", description: "Bandeau info/success/warning/error.", preview: <Message type="info">Message</Message> },
      { slug: "spinner", name: "bpm.spinner", description: "Indicateur de chargement.", preview: <Spinner size="small" text="" /> },
      { slug: "tooltip", name: "bpm.tooltip", description: "Info-bulle au survol.", preview: <Tooltip text="Aide"><span className="underline">?</span></Tooltip> },
    ],
  },
  {
    name: "Utilitaires",
    items: [
      { slug: "modal", name: "bpm.modal", description: "Fenêtre modale.", preview: <span className="text-sm text-[var(--bpm-text-secondary)]">Ouvrir une modal depuis la page doc.</span> },
      { slug: "codeblock", name: "bpm.codeblock", description: "Bloc de code avec Copier.", preview: <CodeBlock code={'print("hello")'} language="python" /> },
    ],
  },
];

export default function DocsComponentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        Composants BPM
      </h1>
      <p className="mb-8" style={{ color: "var(--bpm-text-secondary)" }}>
        Référence des composants avec sandbox live. Cliquez sur une carte pour la documentation.
      </p>
      <div className="space-y-10">
        {CATEGORIES.map((cat) => (
          <section key={cat.name}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--bpm-text-primary)" }}>
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item) => (
                <Link
                  key={item.slug}
                  href={"/docs/components/" + item.slug}
                  className="block p-4 rounded-xl border transition-colors hover:border-[var(--bpm-accent-cyan)]"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
                >
                  <div className="font-mono text-sm font-medium mb-1" style={{ color: "var(--bpm-accent-cyan)" }}>
                    {item.name}
                  </div>
                  <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
                    {item.description}
                  </p>
                  <div className="min-h-[60px] flex items-center justify-center p-3 rounded-lg" style={{ background: "var(--bpm-bg-secondary)" }}>
                    {item.preview}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
