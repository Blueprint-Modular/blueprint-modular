"use client";

import React, { useState } from "react";
import {
  Title,
  Title1,
  Title2,
  Title3,
  Text,
  Caption,
  Markdown,
  Message,
  Badge,
  Chip,
  StatusBox,
  Progress,
  LoadingBar,
  Spinner,
  Skeleton,
  HighlightBox,
  EmptyState,
  Input,
  Textarea,
  NumberInput,
  Selectbox,
  Checkbox,
  Toggle,
  RadioGroup,
  Slider,
  DateInput,
  ColorPicker,
  Autocomplete,
  Panel,
  Card,
  Container,
  Grid,
  Column,
  Divider,
  Expander,
  Accordion,
  Metric,
  MetricRow,
  Table,
  PlotlyChart,
  Timeline,
  JsonViewer,
  CodeBlock,
  Stepper,
  Pagination,
  Treeview,
  Tabs,
  Breadcrumb,
  TopNav,
  Button,
  Modal,
  Drawer,
  Tooltip,
  Popover,
  FAB,
  Avatar,
  Image,
  QRCode,
  Rating,
  FileUploader,
  Video,
  Audio,
  Gps,
} from "@/components/bpm";

const DEMO_CARD_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--bpm-border, #e5e7eb)",
  borderRadius: 8,
  padding: 16,
};

function DemoCard({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div style={{ gridColumn: wide ? "1 / -1" : undefined }}>
      <Caption className="mb-1" style={{ display: "block", marginBottom: 4 }}>
        {label}
      </Caption>
      <div style={DEMO_CARD_STYLE}>{children}</div>
    </div>
  );
}

const SECTIONS = [
  { id: "typography", label: "Typographie" },
  { id: "feedback", label: "Feedback & Status" },
  { id: "forms", label: "Saisie" },
  { id: "layout", label: "Layout & Conteneurs" },
  { id: "data", label: "Données & Visualisation" },
  { id: "navigation", label: "Navigation" },
  { id: "overlays", label: "Overlays & Interactions" },
  { id: "media", label: "Médias & Utilitaires" },
];

const COMPONENT_COUNT = 60;

export default function ComponentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);
  const [radioValue, setRadioValue] = useState("Haute");
  const [sliderValue, setSliderValue] = useState(50);
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState<string | null>("Actif");
  const [tabIndex, setTabIndex] = useState(0);
  const [textareaVal, setTextareaVal] = useState("");
  const [numberVal, setNumberVal] = useState<number | null>(0);
  const [checkboxVal, setCheckboxVal] = useState(false);
  const [dateVal, setDateVal] = useState<Date | string | null>(null);
  const [autocompleteVal, setAutocompleteVal] = useState("");
  const [stepperStep, setStepperStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingVal, setRatingVal] = useState(4);
  const [gpsPickerVal, setGpsPickerVal] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 80, paddingTop: 0 }}>
      {/* Header fixe — paddingTop sur le container pour ne pas couvrir le contenu sur mobile */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bpm-bg-primary, #fff)",
          borderBottom: "1px solid var(--bpm-border, #e5e7eb)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Title level={1} style={{ margin: 0 }}>
          Blueprint Components
        </Title>
        <Caption style={{ margin: 0 }}>
          {COMPONENT_COUNT} composants bpm.*
        </Caption>
      </header>

      {/* Barre de navigation par catégorie */}
      <nav
        style={{
          padding: "12px 24px",
          background: "var(--bpm-bg-secondary, #f1f5f9)",
          borderBottom: "1px solid var(--bpm-border)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              fontSize: 14,
              color: "var(--bpm-accent-cyan, #0ea5e9)",
              textDecoration: "none",
            }}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <Container
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          paddingTop: 16,
        }}
      >
        {/* SECTION 1 — Typographie */}
        <section id="typography" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Typographie</Title2>
          <Grid cols={2} gap={16}>
            <DemoCard label="bpm.title level 1">
              <Title level={1}>Titre niveau 1</Title>
            </DemoCard>
            <DemoCard label="bpm.title level 2">
              <Title level={2}>Titre niveau 2</Title>
            </DemoCard>
            <DemoCard label="bpm.title level 3">
              <Title level={3}>Titre niveau 3</Title>
            </DemoCard>
            <DemoCard label="bpm.text" wide>
              <Text>Texte courant — corps de page standard.</Text>
            </DemoCard>
            <DemoCard label="bpm.caption" wide>
              <Caption>Caption — texte secondaire, 0.75rem.</Caption>
            </DemoCard>
            <DemoCard label="bpm.markdown" wide>
              <Markdown text="**Gras**, *italique*, `code inline`, [lien](#)." />
            </DemoCard>
          </Grid>
        </section>

        {/* SECTION 2 — Feedback & Status */}
        <section id="feedback" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Feedback & Status</Title2>
          <Grid cols={2} gap={16}>
            <DemoCard label="bpm.message success">
              <Message type="success">Opération réussie.</Message>
            </DemoCard>
            <DemoCard label="bpm.message warning">
              <Message type="warning">Attention, vérifiez les données.</Message>
            </DemoCard>
            <DemoCard label="bpm.message error">
              <Message type="error">Une erreur est survenue.</Message>
            </DemoCard>
            <DemoCard label="bpm.badge success">
              <Badge variant="success">Actif</Badge>
            </DemoCard>
            <DemoCard label="bpm.badge warning">
              <Badge variant="warning">En attente</Badge>
            </DemoCard>
            <DemoCard label="bpm.badge default">
              <Badge variant="default">Inactif</Badge>
            </DemoCard>
            <DemoCard label="bpm.chip">
              <Chip label="Étiquette" />
            </DemoCard>
            <DemoCard label="bpm.statusBox">
              <StatusBox label="Connecté" state="complete" defaultExpanded={false} />
            </DemoCard>
            <DemoCard label="bpm.progress">
              <Progress value={65} max={100} label="Progression" showValue />
            </DemoCard>
            <DemoCard label="bpm.loadingBar">
              <LoadingBar />
            </DemoCard>
            <DemoCard label="bpm.spinner">
              <Spinner size="medium" />
            </DemoCard>
            <DemoCard label="bpm.skeleton">
              <div style={{ width: "100%", maxWidth: 400 }}>
                <Skeleton width={200} height={20} />
              </div>
            </DemoCard>
            <DemoCard label="bpm.highlightBox" wide>
              <HighlightBox
                value={1}
                label="INFO"
                title="Information mise en évidence."
              />
            </DemoCard>
            <DemoCard label="bpm.emptyState" wide>
              <EmptyState
                title="Aucune donnée"
                description="Commencez par créer un élément."
              />
            </DemoCard>
          </Grid>
        </section>

        {/* SECTION 3 — Saisie */}
        <section id="forms" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Saisie</Title2>
          <Grid cols={2} gap={16}>
            <DemoCard label="bpm.input">
              <Input
                label="Nom"
                value={inputValue}
                onChange={(v) => setInputValue(v)}
              />
            </DemoCard>
            <DemoCard label="bpm.textarea">
              <Textarea
                label="Description"
                value={textareaVal}
                onChange={setTextareaVal}
              />
            </DemoCard>
            <DemoCard label="bpm.numberInput">
              <NumberInput label="Quantité" value={numberVal} onChange={setNumberVal} />
            </DemoCard>
            <DemoCard label="bpm.selectbox">
              <Selectbox
                label="Statut"
                options={["Actif", "Inactif", "En attente"]}
                value={selectValue}
                onChange={(v) => setSelectValue(v)}
              />
            </DemoCard>
            <DemoCard label="bpm.checkbox">
              <Checkbox label="J'accepte les conditions" checked={checkboxVal} onChange={setCheckboxVal} />
            </DemoCard>
            <DemoCard label="bpm.toggle">
              <Toggle
                label="Notifications"
                value={toggleValue}
                onChange={setToggleValue}
              />
            </DemoCard>
            <DemoCard label="bpm.radioGroup" wide>
              <RadioGroup
                label="Priorité"
                options={[
                  { value: "Haute", label: "Haute" },
                  { value: "Moyenne", label: "Moyenne" },
                  { value: "Basse", label: "Basse" },
                ]}
                value={radioValue}
                onChange={setRadioValue}
              />
            </DemoCard>
            <DemoCard label="bpm.slider">
              <Slider
                label="Volume"
                value={sliderValue}
                min={0}
                max={100}
                onChange={setSliderValue}
              />
            </DemoCard>
            <DemoCard label="bpm.dateInput">
              <DateInput label="Date de livraison" value={dateVal} onChange={setDateVal} />
            </DemoCard>
            <DemoCard label="bpm.colorPicker">
              <ColorPicker
                label="Couleur"
                value="#00a3e2"
                onChange={() => {}}
              />
            </DemoCard>
            <DemoCard label="bpm.autocomplete">
              <Autocomplete
                label="Recherche"
                options={[
                  { value: "Paris", label: "Paris" },
                  { value: "Lyon", label: "Lyon" },
                  { value: "Marseille", label: "Marseille" },
                ]}
                value={autocompleteVal}
                onChange={setAutocompleteVal}
              />
            </DemoCard>
          </Grid>
        </section>

        {/* SECTION 4 — Layout & Conteneurs */}
        <section id="layout" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Layout & Conteneurs</Title2>
          <Grid cols={2} gap={16}>
            <DemoCard label="bpm.panel" wide>
              <Panel title="Panneau standard">
                <Text>Contenu du panneau.</Text>
              </Panel>
            </DemoCard>
            <DemoCard label="bpm.card" wide>
              <Card>
                <Text>Contenu de la carte.</Text>
              </Card>
            </DemoCard>
            <DemoCard label="bpm.container" wide>
              <Container>
                <Text>Contenu dans un conteneur centré.</Text>
              </Container>
            </DemoCard>
            <DemoCard label="bpm.grid + bpm.metric" wide>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <div style={{ minWidth: 120, flex: "1 1 120px" }}>
                  <Metric label="CA" value="142 500 €" />
                </div>
                <div style={{ minWidth: 120, flex: "1 1 120px" }}>
                  <Metric label="Commandes" value="1 284" />
                </div>
                <div style={{ minWidth: 120, flex: "1 1 120px" }}>
                  <Metric label="Clients" value="342" />
                </div>
              </div>
            </DemoCard>
            <DemoCard label="bpm.column" wide>
              <Column columns={2}>
                <Text>Colonne flex.</Text>
              </Column>
            </DemoCard>
            <DemoCard label="bpm.divider" wide>
              <Divider />
            </DemoCard>
            <DemoCard label="bpm.expander" wide>
              <Expander
                title="Section dépliable"
                defaultExpanded={false}
              >
                <Text>Contenu masqué par défaut.</Text>
              </Expander>
            </DemoCard>
            <DemoCard label="bpm.accordion" wide>
              <Accordion
                sections={[
                  { title: "Question 1", content: <Text>Réponse 1.</Text> },
                  { title: "Question 2", content: <Text>Réponse 2.</Text> },
                ]}
              />
            </DemoCard>
          </Grid>
        </section>

        {/* SECTION 5 — Données & Visualisation */}
        <section id="data" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Données & Visualisation</Title2>
          <Grid cols={1} gap={16}>
            <DemoCard label="bpm.metric + delta" wide>
              <Metric
                label="Chiffre d'affaires"
                value="142 500 €"
                delta={12}
                currency="%"
              />
            </DemoCard>
            <DemoCard label="bpm.metricRow" wide>
              <MetricRow>
                <Metric label="CA" value="142 500 €" />
                <Metric label="Marge" value="28%" />
                <Metric label="Clients" value="342" />
              </MetricRow>
            </DemoCard>
            <DemoCard label="bpm.table" wide>
              <div style={{ border: "1px solid var(--bpm-border)", borderRadius: 8, overflow: "hidden" }}>
                <Table
                columns={[
                  { key: "nom", label: "Nom" },
                  { key: "statut", label: "Statut" },
                  { key: "valeur", label: "Valeur" },
                ]}
                data={[
                  { nom: "Alice", statut: "Actif", valeur: "12 000 €" },
                  { nom: "Bob", statut: "Inactif", valeur: "8 500 €" },
                  { nom: "Carol", statut: "Actif", valeur: "21 300 €" },
                ]}
              />
              </div>
            </DemoCard>
            <DemoCard label="bpm.plotlyChart" wide>
              <PlotlyChart
                data={[
                  {
                    type: "bar",
                    x: ["Jan", "Fév", "Mar", "Avr", "Mai"],
                    y: [42, 58, 51, 67, 73],
                    marker: { color: "#00a3e2" },
                  },
                ]}
                layout={{ title: "Ventes mensuelles" }}
                height={300}
              />
            </DemoCard>
            <DemoCard label="bpm.timeline" wide>
              <Timeline
                items={[
                  { date: "2024-01", title: "Lancement" },
                  { date: "2024-06", title: "V1.0" },
                  { date: "2025-01", title: "V2.0" },
                ]}
              />
            </DemoCard>
            <DemoCard label="bpm.jsonViewer" wide>
              <JsonViewer
                data={{
                  id: 1,
                  name: "Blueprint",
                  version: "0.1.43",
                  active: true,
                }}
              />
            </DemoCard>
            <DemoCard label="bpm.codeBlock" wide>
              <CodeBlock
                code="const x = bpm.metric('CA', '142 500 €')"
                language="typescript"
              />
            </DemoCard>
            <DemoCard label="bpm.stepper" wide>
              <Stepper
                steps={[
                  { label: "Étape 1" },
                  { label: "Étape 2" },
                  { label: "Étape 3" },
                ]}
                currentStep={stepperStep}
                onStepClick={setStepperStep}
              />
            </DemoCard>
            <DemoCard label="bpm.pagination" wide>
              <Pagination
                page={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
              />
            </DemoCard>
            <DemoCard label="bpm.treeview" wide>
              <Treeview
                nodes={[
                  {
                    id: "1",
                    label: "Dossier A",
                    children: [
                      { id: "1.1", label: "Fichier 1" },
                      { id: "1.2", label: "Fichier 2" },
                    ],
                  },
                  { id: "2", label: "Dossier B" },
                ]}
              />
            </DemoCard>
          </Grid>
        </section>

        {/* SECTION 6 — Navigation */}
        <section id="navigation" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Navigation</Title2>
          <Grid cols={1} gap={16}>
            <DemoCard label="bpm.tabs" wide>
              <Tabs
                tabs={[
                  { label: "Vue 1", content: <Text>Contenu onglet 1.</Text> },
                  { label: "Vue 2", content: <Text>Contenu onglet 2.</Text> },
                  { label: "Vue 3", content: <Text>Contenu onglet 3.</Text> },
                ]}
                defaultTab={tabIndex}
                onChange={setTabIndex}
              />
            </DemoCard>
            <DemoCard label="bpm.breadcrumb" wide>
              <Breadcrumb
                items={[
                  { label: "Accueil", href: "/" },
                  { label: "Modules", href: "/modules" },
                  { label: "Composants" },
                ]}
              />
            </DemoCard>
            <DemoCard label="bpm.topNav" wide>
              <TopNav
                title="Blueprint App"
                items={[
                  { label: "Dashboard", href: "#" },
                  { label: "Données", href: "#" },
                ]}
              />
            </DemoCard>
          </Grid>
        </section>

        {/* SECTION 7 — Overlays & Interactions */}
        <section id="overlays" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Overlays & Interactions</Title2>
          <Grid cols={2} gap={16}>
            <DemoCard label="bpm.button + bpm.modal" wide>
              <Button onClick={() => setModalOpen(true)}>Ouvrir modal</Button>
              {modalOpen && (
                <Modal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  title="Modal exemple"
                >
                  <Text>Contenu de la modal.</Text>
                </Modal>
              )}
            </DemoCard>
            <DemoCard label="bpm.button + bpm.drawer" wide>
              <Button onClick={() => setDrawerOpen(true)}>Ouvrir drawer</Button>
              <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Drawer exemple"
              >
                <Text>Contenu du drawer.</Text>
              </Drawer>
            </DemoCard>
            <DemoCard label="bpm.tooltip">
              <Tooltip text="Info-bulle au survol">
                <Button>Survolez-moi</Button>
              </Tooltip>
            </DemoCard>
            <DemoCard label="bpm.popover">
              <Popover trigger={<Button>Cliquez</Button>}>
                <Text>Contenu du popover.</Text>
              </Popover>
            </DemoCard>
            <DemoCard label="bpm.fab">
              <div
                style={{
                  position: "relative",
                  height: 80,
                  border: "1px dashed var(--bpm-border)",
                  borderRadius: 8,
                  background: "#f8fafc",
                }}
              >
                <FAB onClick={() => alert("FAB cliqué")} icon="+" />
                <Caption style={{ marginTop: 8, display: "block" }}>
                  bpm.fab — bouton flottant, se positionne en bas à droite de son conteneur parent
                </Caption>
              </div>
            </DemoCard>
          </Grid>
        </section>

        {/* SECTION 8 — Médias & Utilitaires */}
        <section id="media" style={{ marginBottom: 48 }}>
          <Title2 style={{ marginBottom: 16 }}>Médias & Utilitaires</Title2>
          <Grid cols={2} gap={16}>
            <DemoCard label="bpm.avatar">
              <Avatar initials="JD" size="medium" editable onImageChange={(f) => console.log(f)} />
            </DemoCard>
            <DemoCard label="bpm.avatar sidebar">
              <Avatar
                initials="JD"
                name="Jean Dupont"
                subtitle="jean@example.com"
                variant="sidebar"
                onLogout={() => {}}
              />
            </DemoCard>
            <DemoCard label="bpm.video">
              <Video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                width={400}
                height={225}
              />
            </DemoCard>
            <DemoCard label="bpm.audio">
              <Audio src="https://www.w3schools.com/html/horse.mp3" controls />
            </DemoCard>
            <DemoCard label="bpm.image" wide>
              <Image
                src="https://picsum.photos/400/200"
                alt="Image exemple"
                width={400}
                height={200}
              />
            </DemoCard>
            <DemoCard label="bpm.qrCode">
              <QRCode value="https://blueprint-modular.com" size={128} />
            </DemoCard>
            <DemoCard label="bpm.rating">
              <Rating value={ratingVal} max={5} onChange={setRatingVal} />
            </DemoCard>
            <DemoCard label="bpm.fileUploader" wide>
              <FileUploader label="Importer un fichier" onFiles={() => {}} />
            </DemoCard>
          </Grid>

          {/* Section GPS (après Médias) */}
          <Title2 style={{ marginTop: 32, marginBottom: 16 }}>bpm.gps</Title2>
          <Grid cols={1} gap={16}>
            <DemoCard label="bpm.gps — affichage position" wide>
              <Gps label="Position actuelle" showMap height={250} />
            </DemoCard>
            <DemoCard label="bpm.gps — sélection d'un point" wide>
              <Gps
                label="Sélectionner un point"
                mode="picker"
                value={gpsPickerVal}
                onChange={setGpsPickerVal}
                height={250}
              />
            </DemoCard>
          </Grid>
        </section>
      </Container>
    </div>
  );
}
