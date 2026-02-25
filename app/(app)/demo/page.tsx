"use client";

import React, { useState } from "react";
import {
  Title,
  Metric,
  Button,
  Panel,
  Message,
  Table,
  Tabs,
  Input,
  Textarea,
  Selectbox,
  Checkbox,
  Toggle,
  Slider,
  Progress,
  Badge,
  Card,
  Breadcrumb,
  Divider,
  LineChart,
  BarChart,
  Spinner,
  EmptyState,
  Grid,
  Chip,
  Stepper,
  Expander,
  StatusBox,
  Tooltip,
  Empty,
} from "@/components/bpm";

const DEMO_TABS = [
  {
    label: "Vue d’ensemble",
    content: (
      <div className="space-y-4">
        <p style={{ color: "var(--bpm-text-secondary)", fontSize: "0.9375rem" }}>
          Cette page utilise <strong>uniquement</strong> les composants <code>bpm.*</code> — comme une application tierce construite avec Blueprint Modular.
        </p>
        <Metric label="CA (k€)" value={142.5} delta={12.3} />
        <Metric label="Commandes" value={1_248} />
        <Metric label="Taux de conversion" value="3,2 %" />
      </div>
    ),
  },
  {
    label: "Formulaires",
    content: (
      <div className="space-y-4 max-w-md">
        <Input label="Nom" placeholder="Saisir un nom" value="" onChange={() => {}} />
        <Textarea label="Commentaire" rows={3} value="" onChange={() => {}} placeholder="Votre message…" />
        <Selectbox
          label="Type"
          options={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
          value={null}
          onChange={() => {}}
          placeholder="Choisir…"
        />
        <Checkbox label="J’accepte les conditions" checked={false} onChange={() => {}} />
        <Toggle value={false} onChange={() => {}} label="Notifications activées" />
        <Slider value={50} min={0} max={100} onChange={() => {}} label="Volume" />
      </div>
    ),
  },
  {
    label: "Données & feedback",
    content: (
      <div className="space-y-4">
        <Message type="success">Opération enregistrée.</Message>
        <Message type="warning">Vérifiez la date d’échéance.</Message>
        <Progress value={65} max={100} label="Avancement" showValue />
        <Spinner size="medium" text="Chargement…" />
        <StatusBox label="Traitement en cours" state="running" defaultExpanded>
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Détails ou message additionnel.</p>
        </StatusBox>
      </div>
    ),
  },
];

const TABLE_COLUMNS = [
  { key: "produit", label: "Produit" },
  { key: "qté", label: "Qté" },
  { key: "statut", label: "Statut" },
];

const TABLE_DATA = [
  { id: "1", produit: "Commande A", qté: "12", statut: "En cours" },
  { id: "2", produit: "Commande B", qté: "8", statut: "Livré" },
  { id: "3", produit: "Commande C", qté: "24", statut: "En attente" },
];

const LINE_DATA = [
  { x: "Jan", y: 120 },
  { x: "Fév", y: 150 },
  { x: "Mar", y: 130 },
  { x: "Avr", y: 180 },
];

const BAR_DATA = [
  { x: "Alice", y: 90 },
  { x: "Bob", y: 110 },
  { x: "Charlie", y: 85 },
];

export default function DemoPage() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="doc-page" style={{ maxWidth: 960, margin: "0 auto" }}>
      <Breadcrumb items={[{ label: "Demo", href: "/demo" }]} />
      <Title level={1}>Demo bpm.*</Title>
      <p className="doc-description" style={{ marginTop: 8, marginBottom: 24 }}>
        Application de démonstration construite uniquement avec les composants BPM — pour tester le rendu et les interactions comme un développeur tiers.
      </p>

      <Divider />

      <section style={{ marginTop: 24 }}>
        <Title level={2}>Actions & panneaux</Title>
        <div className="flex flex-wrap gap-3 mt-3">
          <Button onClick={() => setClickCount((c) => c + 1)}>Bouton principal</Button>
          <Button variant="secondary" onClick={() => setClickCount(0)}>Réinitialiser</Button>
          <Button variant="outline">Outline</Button>
          {clickCount > 0 && (
            <Badge variant="primary">{clickCount} clic{clickCount > 1 ? "s" : ""}</Badge>
          )}
        </div>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          <Panel variant="info" title="Info">Contenu du panneau info.</Panel>
          <Panel variant="warning" title="Attention">Message d’avertissement.</Panel>
          <Card title="Carte" variant="outlined">Contenu de la carte.</Card>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <Title level={2}>Onglets</Title>
        <div className="mt-3">
          <Tabs tabs={DEMO_TABS} defaultTab={0} />
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <Title level={2}>Tableau</Title>
        <div className="mt-3 overflow-x-auto">
          <Table
            columns={TABLE_COLUMNS}
            data={TABLE_DATA}
            striped
            hover
            onRowClick={(row) => console.log("Row clicked", row)}
          />
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <Title level={2}>Graphiques</Title>
        <Grid cols={2} gap="1rem" className="mt-3">
          <div>
            <Caption>Ventes (linechart)</Caption>
            <LineChart data={LINE_DATA} width={360} height={200} />
          </div>
          <div>
            <Caption>Par commercial (barchart)</Caption>
            <BarChart data={BAR_DATA} width={360} height={200} />
          </div>
        </Grid>
      </section>

      <section style={{ marginTop: 32 }}>
        <Title level={2}>Autres composants</Title>
        <div className="flex flex-wrap gap-2 mt-3">
          <Chip label="Tag 1" variant="primary" />
          <Chip label="Tag 2" />
          <Tooltip text="Info au survol">
            <span style={{ textDecoration: "underline", cursor: "help" }}>Survoler</span>
          </Tooltip>
        </div>
        <div className="mt-4">
          <Stepper steps={[{ id: "1", label: "Étape 1" }, { id: "2", label: "Étape 2" }, { id: "3", label: "Étape 3" }]} currentStep={1} />
        </div>
        <div className="mt-4">
          <Expander title="Détails (expander)" defaultExpanded>
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Contenu dépliable.</p>
          </Expander>
        </div>
        <div className="mt-4">
          <EmptyState title="Aucune donnée" description="Exemple d’état vide." />
        </div>
        <div className="mt-4">
          <Empty>
            <span style={{ color: "var(--bpm-text-secondary)", fontSize: "0.875rem" }}>—</span>
          </Empty>
        </div>
      </section>
    </div>
  );
}
