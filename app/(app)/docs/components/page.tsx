"use client";

import Link from "next/link";
import {
  Metric,
  Button,
  Panel,
  Table,
  Tabs,
  Title,
  Toggle,
  Theme,
  Message,
  Spinner,
  Tooltip,
  Selectbox,
  NumberInput,
  Expander,
  CodeBlock,
  Badge,
  Progress,
  Skeleton,
  Accordion,
  Card,
  Divider,
  Grid,
  Column,
  EmptyState,
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  Slider,
  DateInput,
  ColorPicker,
  Chip,
  Breadcrumb,
  Stepper,
  Avatar,
} from "@/components/bpm";
import registry from "@/lib/generated/bpm-components.json";

type ComponentEntry = (typeof registry.components)[number];

/** Previews par slug (React) — les données nom/description/catégorie viennent du registry Python. */
const PREVIEW_BY_SLUG: Record<string, React.ReactNode> = {
  metric: <Metric value={142500} label="CA" delta={3200} />,
  table: <Table columns={[{ key: "A", label: "A" }, { key: "B", label: "B" }]} data={[{ A: "1", B: "2" }]} />,
  title: <Title level={2}>Titre</Title>,
  badge: <Badge variant="success">OK</Badge>,
  progress: <Progress value={60} max={100} />,
  skeleton: <Skeleton variant="text" />,
  panel: <Panel variant="info" title="Info">Contenu</Panel>,
  tabs: <Tabs tabs={[{ label: "Onglet 1", content: null }, { label: "Onglet 2", content: null }]} />,
  expander: <Expander title="Détails">Contenu</Expander>,
  accordion: <Accordion sections={[{ id: "s1", title: "Section 1", content: <p>Contenu</p> }]} defaultOpenIds={["s1"]} />,
  card: <Card title="Carte">Contenu</Card>,
  divider: <Divider />,
  grid: <Grid cols={2} gap="0.5rem"><div className="p-2 rounded bg-[var(--bpm-bg-secondary)]">1</div><div className="p-2 rounded bg-[var(--bpm-bg-secondary)]">2</div></Grid>,
  column: <Column columns={3}><div className="p-2 rounded bg-[var(--bpm-bg-secondary)] text-sm">1</div><div className="p-2 rounded bg-[var(--bpm-bg-secondary)] text-sm">2</div><div className="p-2 rounded bg-[var(--bpm-bg-secondary)] text-sm">3</div></Column>,
  emptystate: <EmptyState title="Aucune donnée" description="Ajoutez des éléments." />,
  button: <Button>Action</Button>,
  toggle: <Toggle value={false} onChange={() => {}} label="Option" />,
  theme: <Theme variant="toggle" />,
  selectbox: <Selectbox options={[{ value: "a", label: "Option A" }]} value={null} onChange={() => {}} placeholder="Choisir" />,
  numberinput: <NumberInput value={10} onChange={() => {}} label="Quantité" />,
  input: <Input value="" onChange={() => {}} label="Nom" placeholder="Saisir..." />,
  textarea: <Textarea value="" onChange={() => {}} label="Commentaire" rows={2} />,
  checkbox: <Checkbox checked={false} onChange={() => {}} label="Accepter" />,
  radiogroup: <RadioGroup options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} value="a" onChange={() => {}} />,
  slider: <Slider value={50} min={0} max={100} onChange={() => {}} />,
  dateinput: <DateInput value="" onChange={() => {}} label="Date" />,
  colorpicker: <ColorPicker value="#00a3e0" onChange={() => {}} />,
  chip: <Chip label="Tag" variant="default" />,
  message: <Message type="info">Message</Message>,
  spinner: <Spinner size="small" text="" />,
  tooltip: <Tooltip text="Aide"><span className="underline">?</span></Tooltip>,
  breadcrumb: <Breadcrumb items={[{ label: "Accueil", href: "#" }, { label: "Doc", href: "#" }]} />,
  stepper: <Stepper steps={[{ label: "Étape 1" }, { label: "Étape 2" }]} currentStep={0} />,
  avatar: <Avatar initials="JD" size="medium" />,
  modal: <span className="text-sm text-[var(--bpm-text-secondary)]">Ouvrir une modal depuis la page doc.</span>,
  codeblock: <CodeBlock code={'print("hello")'} language="python" />,
};

function groupByCategory(components: ComponentEntry[]): { name: string; items: ComponentEntry[] }[] {
  const byCat = new Map<string, ComponentEntry[]>();
  for (const c of components) {
    const list = byCat.get(c.category) ?? [];
    list.push(c);
    byCat.set(c.category, list);
  }
  return Array.from(byCat.entries()).map(([name, items]) => ({ name, items }));
}

export default function DocsComponentsPage() {
  const categories = groupByCategory(registry.components);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>Composants BPM</h1>
        <p className="doc-description">
          Référence des composants avec sandbox live. La liste est alimentée par le package Python{" "}
          <code className="text-sm">blueprint-modular</code> (pip install). Cliquez sur une carte pour la documentation.
        </p>
      </div>
      <div className="space-y-10">
        {categories.map((cat) => (
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
                    {PREVIEW_BY_SLUG[item.slug] ?? null}
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
