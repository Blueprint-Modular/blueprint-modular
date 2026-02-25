"use client";

import React, { useState, useMemo } from "react";
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
  Text,
  Caption,
  JsonViewer,
  DateRangePicker,
  TimeInput,
  Rating,
  FileUploader,
  Container,
  Empty,
  Popover,
  StatusBox,
  Audio,
  Video,
  Html,
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  Barcode,
  QRCode,
  NfcBadge,
  Drawer,
  Pagination,
} from "@/components/bpm";
import registry from "@/lib/generated/bpm-components.json";

type ComponentEntry = (typeof registry.components)[number];

/** Wrapper pour que l'aperçu soit visible dans la carte (min-height + centrage). */
function PreviewBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: 8 }}>
      {children}
    </div>
  );
}

/** Previews par slug (React) — les données nom/description/catégorie viennent du registry Python. */
const PREVIEW_BY_SLUG: Record<string, React.ReactNode> = {
  metric: <Metric value={142500} label="CA" delta={3200} />,
  table: <Table columns={[{ key: "A", label: "A" }, { key: "B", label: "B" }]} data={[{ A: "1", B: "2" }]} />,
  title: <Title level={2}>Titre</Title>,
  text: <PreviewBox><Text>Texte corps</Text></PreviewBox>,
  caption: <PreviewBox><Caption>Légende</Caption></PreviewBox>,
  badge: <Badge variant="success">OK</Badge>,
  progress: <Progress value={60} max={100} />,
  skeleton: <Skeleton variant="text" />,
  jsonviewer: <JsonViewer data={{ a: 1, b: "x" }} defaultExpandedLevel={1} />,
  panel: <Panel variant="info" title="Info">Contenu</Panel>,
  tabs: <Tabs tabs={[{ label: "Onglet 1", content: null }, { label: "Onglet 2", content: null }]} />,
  expander: <Expander title="Détails">Contenu</Expander>,
  accordion: <Accordion sections={[{ id: "s1", title: "Section 1", content: <p>Contenu</p> }]} defaultOpenIds={["s1"]} />,
  card: <Card title="Carte">Contenu</Card>,
  divider: <Divider />,
  grid: <Grid cols={2} gap="0.5rem"><div className="p-2 rounded bg-[var(--bpm-bg-secondary)]">1</div><div className="p-2 rounded bg-[var(--bpm-bg-secondary)]">2</div></Grid>,
  column: <Column columns={3}><div className="p-2 rounded bg-[var(--bpm-bg-secondary)] text-sm">1</div><div className="p-2 rounded bg-[var(--bpm-bg-secondary)] text-sm">2</div><div className="p-2 rounded bg-[var(--bpm-bg-secondary)] text-sm">3</div></Column>,
  emptystate: <EmptyState title="Aucune donnée" description="Ajoutez des éléments." />,
  container: <PreviewBox><Container><span className="text-sm">Contenu</span></Container></PreviewBox>,
  empty: <PreviewBox><Empty><span className="text-sm opacity-70">—</span></Empty></PreviewBox>,
  popover: <PreviewBox><Popover trigger={<Button size="small">Ouvrir</Button>}><span className="text-sm">Contenu</span></Popover></PreviewBox>,
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
  daterangepicker: <PreviewBox><DateRangePicker start={null} end={null} onChange={() => {}} label="Plage" /></PreviewBox>,
  timeinput: <PreviewBox><TimeInput value={null} onChange={() => {}} label="Heure" /></PreviewBox>,
  rating: <PreviewBox><Rating value={3} max={5} onChange={() => {}} /></PreviewBox>,
  fileuploader: <PreviewBox><FileUploader label="Fichier" onFiles={() => {}} /></PreviewBox>,
  colorpicker: <ColorPicker value="#00a3e0" onChange={() => {}} />,
  chip: <Chip label="Tag" variant="default" />,
  message: <Message type="info">Message</Message>,
  spinner: <Spinner size="small" text="" />,
  tooltip: <Tooltip text="Aide"><span className="underline">?</span></Tooltip>,
  statusbox: <PreviewBox><StatusBox label="Statut" state="complete" /></PreviewBox>,
  breadcrumb: <Breadcrumb items={[{ label: "Accueil", href: "#" }, { label: "Doc", href: "#" }]} />,
  stepper: <Stepper steps={[{ label: "Étape 1" }, { label: "Étape 2" }]} currentStep={0} />,
  avatar: <Avatar initials="JD" size="medium" />,
  audio: <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>bpm.audio</span>,
  video: <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>bpm.video</span>,
  html: <PreviewBox><Html html="<strong>HTML</strong>" /></PreviewBox>,
  linechart: <LineChart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }]} width={120} height={60} />,
  barchart: <BarChart data={[{ x: "A", y: 40 }, { x: "B", y: 60 }]} width={120} height={60} />,
  areachart: <AreaChart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={120} height={60} />,
  scatterchart: <ScatterChart data={[{ x: 1, y: 2 }, { x: 2, y: 3 }]} width={120} height={60} />,
  modal: <span className="text-sm text-[var(--bpm-text-secondary)]">Ouvrir une modal depuis la page doc.</span>,
  codeblock: <CodeBlock code={'print("hello")'} language="python" />,
  barcode: <Barcode value="1234567890123" height={40} />,
  qrcode: <QRCode value="https://blueprint-modular.com" size={80} />,
  nfcbadge: <NfcBadge label="Scannable" variant="primary" />,
  drawer: <PreviewBox><span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>bpm.drawer (ouvrir avec state)</span></PreviewBox>,
  pagination: <Pagination page={1} totalPages={5} onPageChange={() => {}} />,
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
  const [searchQuery, setSearchQuery] = useState("");
  const categories = groupByCategory(registry.components);

  const keywords = useMemo(
    () =>
      searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [searchQuery]
  );

  const filteredCategories = useMemo(() => {
    if (keywords.length === 0) return categories;
    return categories
      .map((cat) => ({
        name: cat.name,
        items: cat.items.filter((item) => {
          const text = `${item.name} ${item.description} ${cat.name}`.toLowerCase();
          return keywords.every((kw) => text.includes(kw));
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, keywords]);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>Composants</h1>
        <p className="doc-description">
          Référence des composants avec sandbox live. La liste est alimentée par le package Python{" "}
          <code className="text-sm">blueprint-modular</code> (pip install). Cliquez sur une carte pour la documentation.
        </p>
        <div className="mt-4 max-w-md">
          <Input
            type="search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un composant (mots-clés…)"
            aria-label="Rechercher un composant par mots-clés"
          />
        </div>
      </div>
      <div className="space-y-10">
        {filteredCategories.map((cat) => (
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
