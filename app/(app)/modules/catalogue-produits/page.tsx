"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Table, Button } from "@/components/bpm";

const prodData = [{ ref: "P001", nom: "Produit A", prix: "12.50", stock: "42" }];

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Fiche produit, variantes, prix, stock. Codes-barres et QR optionnels.
    </p>
    <CodeBlock code={'bpm.title("Catalogue")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Catalogue (démo)">
      <Table columns={[{ key: "ref", label: "Réf" }, { key: "nom", label: "Nom" }, { key: "prix", label: "Prix" }, { key: "stock", label: "Stock" }]} data={prodData} striped hover />
      <Button size="small" className="mt-4">Ajouter</Button>
    </Panel>
  );
}

export default function CatalogueProduitsModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Catalogue produits</div>
        <h1>Catalogue produits</h1>
        <p className="doc-description">Fiche produit, variantes, prix, stock. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Métier</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/catalogue-produits/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
