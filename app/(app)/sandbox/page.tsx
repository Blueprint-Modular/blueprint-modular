"use client";

import React, { Suspense, useMemo, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Panel,
  Message,
  Button,
  Metric,
  Table,
  Tabs,
  Title,
  Spinner,
  Tooltip,
  CodeBlock,
  Badge,
  Card,
  Input,
  Textarea,
  Checkbox,
  Toggle,
  Selectbox,
  Accordion,
  Expander,
  Avatar,
  Slider,
  Progress,
  Skeleton,
  Breadcrumb,
  Divider,
  EmptyState,
  Chip,
  Modal,
  HighlightBox,
  Stepper,
  Markdown,
  JsonViewer,
  Empty,
  Grid,
  Column,
  Theme,
  Container,
  StatusBox,
  NumberInput,
  DateInput,
  RadioGroup,
  Rating,
  FileUploader,
  ColorPicker,
  LineChart,
  BarChart,
  AreaChart,
  Video,
  Audio,
  TopNav,
  FAB,
  Treeview,
  Timeline,
  Image,
  PdfViewer,
  Autocomplete,
  PlotlyChart,
  Map,
  AltairChart,
  ScatterChart,
} from "@/components/bpm";

const DEFAULT_CODE = `bpm.title("Ma page", level=1)
bpm.metric("CA", "142 500")
bpm.button("Valider")
bpm.panel("Info", "Contenu du panneau.")
bpm.message("Message de confirmation", type="success")`;

/** Parse une ligne du type bpm.xxx("...", ...) et retourne un noeud React ou null */
function parseBpmLine(line: string, key: number): React.ReactNode {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const titleMatch = trimmed.match(/bpm\.title\s*\(\s*["']([^"']*)["']\s*(?:,\s*level\s*=\s*(\d))?\s*\)/);
  if (titleMatch) {
    const level = titleMatch[2] ? Math.min(3, Math.max(1, parseInt(titleMatch[2], 10))) : 1;
    return <Title key={key} level={level as 1 | 2 | 3}>{titleMatch[1]}</Title>;
  }

  const metricMatch = trimmed.match(/bpm\.metric\s*\(\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']\s*(?:,\s*delta\s*=\s*(-?\d+(?:\.\d+)?))?\s*(?:,\s*border\s*=\s*(True|False))?\s*\)/);
  if (metricMatch) {
    const delta = metricMatch[3] != null ? parseFloat(metricMatch[3]) : undefined;
    const border = metricMatch[4] === undefined || metricMatch[4] === "True";
    return <Metric key={key} label={metricMatch[1]} value={metricMatch[2]} delta={delta} border={border} />;
  }

  const buttonMatch = trimmed.match(/bpm\.button\s*\(\s*["']([^"']*)["']\s*\)/);
  if (buttonMatch) {
    return <Button key={key}>{buttonMatch[1]}</Button>;
  }

  const panelMatch = trimmed.match(/bpm\.panel\s*\(\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']\s*(?:,\s*variant\s*=\s*["'](\w+)["'])?\s*\)/);
  if (panelMatch) {
    const variant = (panelMatch[3] as "info" | "success" | "warning" | "error") || "info";
    return <Panel key={key} variant={variant} title={panelMatch[1]}>{panelMatch[2]}</Panel>;
  }

  const messageMatch = trimmed.match(/bpm\.message\s*\(\s*["']([^"']*)["']\s*(?:,\s*type\s*=\s*["'](\w+)["'])?\s*\)/);
  if (messageMatch) {
    const type = (messageMatch[2] as "info" | "success" | "warning" | "error") || "info";
    return <Message key={key} type={type}>{messageMatch[1]}</Message>;
  }

  const spinnerMatch = trimmed.match(/bpm\.spinner\s*\(\s*(?:text\s*=\s*["']([^"']*)["'])?\s*\)/);
  if (spinnerMatch) {
    return <Spinner key={key} size="medium" text={spinnerMatch[1] ?? ""} />;
  }

  const codeblockMatch = trimmed.match(/bpm\.codeblock\s*\(\s*["']([^"']*)["']\s*(?:,\s*language\s*=\s*["'](\w+)["'])?\s*\)/);
  if (codeblockMatch) {
    const code = codeblockMatch[1].replace(/\\n/g, "\n");
    return <CodeBlock key={key} code={code} language={(codeblockMatch[2] as "python" | "javascript") ?? "python"} />;
  }

  // bpm.linechart("x1,y1;x2,y2;...") ou bpm.linechart()
  const linechartMatch = trimmed.match(/bpm\.linechart\s*\(\s*(?:["']([^"']*)["'])?\s*\)/);
  if (linechartMatch) {
    const data = parseChartData(linechartMatch[1]);
    return (
      <div key={key} style={{ width: 400, height: 180 }}>
        <LineChart data={data} width={400} height={180} />
      </div>
    );
  }

  // bpm.barchart("x1,y1;x2,y2;...") ou bpm.barchart()
  const barchartMatch = trimmed.match(/bpm\.barchart\s*\(\s*(?:["']([^"']*)["'])?\s*\)/);
  if (barchartMatch) {
    const data = parseChartData(barchartMatch[1]);
    return (
      <div key={key} style={{ width: 400, height: 180 }}>
        <BarChart data={data} width={400} height={180} />
      </div>
    );
  }

  // bpm.areachart("x1,y1;x2,y2;...") ou bpm.areachart()
  const areachartMatch = trimmed.match(/bpm\.areachart\s*\(\s*(?:["']([^"']*)["'])?\s*\)/);
  if (areachartMatch) {
    const data = parseChartData(areachartMatch[1]);
    return (
      <div key={key} style={{ width: 400, height: 180 }}>
        <AreaChart data={data} width={400} height={180} />
      </div>
    );
  }

  // bpm.scatterchart("x1,y1;x2,y2;...") — x,y numériques
  const scatterchartMatch = trimmed.match(/bpm\.scatterchart\s*\(\s*(?:["']([^"']*)["'])?\s*\)/);
  if (scatterchartMatch) {
    const raw = parseChartData(scatterchartMatch[1]);
    const data = raw.map((d) => ({ x: Number(d.x) || 0, y: d.y }));
    return (
      <div key={key} style={{ width: 400, height: 180 }}>
        <ScatterChart data={data} width={400} height={180} />
      </div>
    );
  }

  return null;
}

/** Parse "x1,y1;x2,y2;x3,y3" en données { x, y }[] ; défaut si vide. */
function parseChartData(str: string | undefined): { x: string; y: number }[] {
  const defaultData = [{ x: "A", y: 30 }, { x: "B", y: 45 }, { x: "C", y: 25 }];
  if (!str || !str.trim()) return defaultData;
  return str.split(";").map((pair) => {
    const [x = "", yStr = "0"] = pair.trim().split(",").map((s) => s.trim());
    return { x, y: Number.parseFloat(yStr) || 0 };
  }).filter((d) => d.x.length > 0);
}

function parseCodeToPreview(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  code.split("\n").forEach((line, i) => {
    const node = parseBpmLine(line, i);
    if (node) nodes.push(node);
  });
  return nodes;
}

const SANDBOX_COMPONENTS = [
  { value: "panel", label: "bpm.panel" },
  { value: "message", label: "bpm.message" },
  { value: "button", label: "bpm.button" },
  { value: "metric", label: "bpm.metric" },
  { value: "table", label: "bpm.table" },
  { value: "tabs", label: "bpm.tabs" },
  { value: "title", label: "bpm.title" },
  { value: "spinner", label: "bpm.spinner" },
  { value: "tooltip", label: "bpm.tooltip" },
  { value: "codeblock", label: "bpm.codeblock" },
  { value: "badge", label: "bpm.badge" },
  { value: "card", label: "bpm.card" },
  { value: "input", label: "bpm.input" },
  { value: "textarea", label: "bpm.textarea" },
  { value: "checkbox", label: "bpm.checkbox" },
  { value: "toggle", label: "bpm.toggle" },
  { value: "selectbox", label: "bpm.selectbox" },
  { value: "accordion", label: "bpm.accordion" },
  { value: "expander", label: "bpm.expander" },
  { value: "avatar", label: "bpm.avatar" },
  { value: "slider", label: "bpm.slider" },
  { value: "progress", label: "bpm.progress" },
  { value: "skeleton", label: "bpm.skeleton" },
  { value: "breadcrumb", label: "bpm.breadcrumb" },
  { value: "divider", label: "bpm.divider" },
  { value: "emptystate", label: "bpm.emptystate" },
  { value: "chip", label: "bpm.chip" },
  { value: "modal", label: "bpm.modal" },
  { value: "highlightbox", label: "bpm.highlightbox" },
  { value: "stepper", label: "bpm.stepper" },
  { value: "markdown", label: "bpm.markdown" },
  { value: "jsonviewer", label: "bpm.jsonviewer" },
  { value: "empty", label: "bpm.empty" },
  { value: "grid", label: "bpm.grid" },
  { value: "column", label: "bpm.column" },
  { value: "theme", label: "bpm.theme" },
  { value: "container", label: "bpm.container" },
  { value: "statusbox", label: "bpm.statusbox" },
  { value: "numberinput", label: "bpm.numberinput" },
  { value: "dateinput", label: "bpm.dateinput" },
  { value: "radiogroup", label: "bpm.radiogroup" },
  { value: "rating", label: "bpm.rating" },
  { value: "fileuploader", label: "bpm.fileuploader" },
  { value: "colorpicker", label: "bpm.colorpicker" },
  { value: "linechart", label: "bpm.linechart" },
  { value: "barchart", label: "bpm.barchart" },
  { value: "areachart", label: "bpm.areachart" },
  { value: "scatterchart", label: "bpm.scatterchart" },
  { value: "video", label: "bpm.video" },
  { value: "audio", label: "bpm.audio" },
  { value: "topnav", label: "bpm.topnav" },
  { value: "fab", label: "bpm.fab" },
  { value: "treeview", label: "bpm.treeview" },
  { value: "timeline", label: "bpm.timeline" },
  { value: "image", label: "bpm.image" },
  { value: "pdf", label: "bpm.pdf" },
  { value: "autocomplete", label: "bpm.autocomplete" },
  { value: "plotly", label: "bpm.plotly" },
  { value: "map", label: "bpm.map" },
  { value: "altair", label: "bpm.altair" },
] as const;

const SANDBOX_MODULES = [
  { href: "/modules/auth", label: "Auth", description: "Authentification (Google, e-mail), session et whitelist." },
  { href: "/modules/wiki", label: "Wiki", description: "Wiki interne et pages documentées." },
  { href: "/modules/ia", label: "IA", description: "Assistant et chat IA." },
  { href: "/modules/documents", label: "Analyse de documents", description: "Analyse et gestion de documents." },
  { href: "/modules/contracts", label: "Base contractuelle", description: "Contrats fournisseurs et CGV : upload, analyse IA." },
  { href: "/modules/veille", label: "Veille", description: "Veille et flux d'information." },
  { href: "/modules/notification", label: "Notification", description: "Historique des notifications, niveaux 1–3." },
] as const;

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const component = (searchParams.get("component") || searchParams.get("c") || "panel").toLowerCase().replace("bpm.", "");
  const variant = searchParams.get("variant") || searchParams.get("v") || "info";
  const title = searchParams.get("title") || searchParams.get("t") || "";
  const value = searchParams.get("value") || "";
  const label = searchParams.get("label") || "";
  const theme = (searchParams.get("theme") || searchParams.get("th") || "light").toLowerCase();
  const isDark = theme === "dark";
  const [tableSelectedRow, setTableSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<"selector" | "code" | "ai">("code");
  const [aiDescription, setAiDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionPrefix, setCompletionPrefix] = useState("");
  const [completionIndex, setCompletionIndex] = useState(0);
  const codeInputRef = useRef<HTMLTextAreaElement>(null);
  const completionStartRef = useRef(0);
  const selectionStartRef = useRef(0);

  const completionList = useMemo(() => {
    const prefix = completionPrefix.toLowerCase();
    return SANDBOX_COMPONENTS.filter((c) => c.value.toLowerCase().startsWith(prefix)).slice(0, 14);
  }, [completionPrefix]);

  useEffect(() => {
    setCompletionIndex((i) => Math.min(i, Math.max(0, completionList.length - 1)));
  }, [completionList.length]);

  const applyCompletion = useCallback(
    (method: string) => {
      const start = completionStartRef.current;
      const end = selectionStartRef.current;
      const newCode = code.slice(0, start) + "bpm." + method + code.slice(end);
      setCode(newCode);
      setCompletionOpen(false);
      setTimeout(() => {
        codeInputRef.current?.focus();
        const pos = start + "bpm.".length + method.length;
        codeInputRef.current?.setSelectionRange(pos, pos);
      }, 0);
    },
    [code]
  );

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const sel = e.target.selectionStart ?? 0;
      setCode(value);
      selectionStartRef.current = sel;
      const textBefore = value.slice(0, sel);
      const match = textBefore.match(/bpm\.([a-z]*)$/i);
      if (match) {
        const prefix = match[1];
        completionStartRef.current = textBefore.lastIndexOf("bpm.");
        setCompletionPrefix(prefix);
        setCompletionOpen(true);
        setCompletionIndex(0);
      } else {
        setCompletionOpen(false);
      }
    },
    []
  );

  const handleCodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!completionOpen || completionList.length === 0) return;
      if (e.key === "ArrowDown") {
        setCompletionIndex((i) => Math.min(i + 1, completionList.length - 1));
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowUp") {
        setCompletionIndex((i) => Math.max(0, i - 1));
        e.preventDefault();
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        applyCompletion(completionList[completionIndex].value);
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        setCompletionOpen(false);
        e.preventDefault();
      }
    },
    [completionOpen, completionList, completionIndex, applyCompletion]
  );

  const setParams = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    router.replace(`/sandbox?${p.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("theme-dark");
    else document.documentElement.classList.remove("theme-dark");
    return () => document.documentElement.classList.remove("theme-dark");
  }, [isDark]);

  const content = useMemo(() => {
    if (component === "panel") {
      return (
        <Panel variant={variant as "info" | "success" | "warning" | "error"} title={title || `Panneau ${variant}`}>
          Contenu du panneau. Variante : <strong>{variant}</strong>.
        </Panel>
      );
    }
    if (component === "message") {
      return (
        <Message type={variant as "info" | "success" | "warning" | "error"}>
          {title ? <strong>{title}</strong> : null}
          {title && <br />}
          Contenu du message.
        </Message>
      );
    }
    if (component === "button") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="small">Small</Button>
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      );
    }
    if (component === "metric") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Metric label={label || "CA"} value={value || "142 500"} delta={3200} />
          <Metric label="Taux" value="12,5 %" />
          <Metric label="Tendance" value="+3,2 %" delta={3.2} />
        </div>
      );
    }
    if (component === "table") {
      const columns = [{ key: "name", label: "Nom" }, { key: "val", label: "Valeur" }];
      const data = [{ name: "A", val: "1" }, { name: "B", val: "2" }, { name: "C", val: "3" }];
      return (
        <div style={{ padding: 16 }}>
          <Table columns={columns} data={data} onRowClick={(row) => setTableSelectedRow(row)} />
          {tableSelectedRow && (
            <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Ligne cliquée : {JSON.stringify(tableSelectedRow)}
            </p>
          )}
        </div>
      );
    }
    if (component === "tabs") {
      const tabItems = [
        { label: "Onglet 1", content: <div>Contenu onglet 1</div> },
        { label: "Onglet 2", content: <div>Contenu onglet 2</div> },
      ];
      return (
        <div style={{ padding: 16 }}>
          <Tabs tabs={tabItems} />
        </div>
      );
    }
    if (component === "title") {
      return (
        <div style={{ padding: 16 }}>
          <Title level={1}>Titre niveau 1</Title>
          <Title level={2}>Titre niveau 2</Title>
          <Title level={3}>Titre niveau 3</Title>
        </div>
      );
    }
    if (component === "spinner") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <Spinner size="small" text="" />
          <Spinner size="medium" text="Chargement…" />
        </div>
      );
    }
    if (component === "tooltip") {
      return (
        <div style={{ padding: 16 }}>
          <Tooltip text="Info-bulle au survol"><span className="underline">Survolez-moi</span></Tooltip>
        </div>
      );
    }
    if (component === "codeblock") {
      return (
        <div style={{ padding: 16 }}>
          <CodeBlock code='bpm.title("Hello")\nbpm.metric("CA", 142500)' language="python" />
        </div>
      );
    }
    if (component === "badge") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      );
    }
    if (component === "card") {
      return (
        <div style={{ padding: 16 }}>
          <Card title="Carte exemple" subtitle="Sous-titre" variant="outlined">
            Contenu de la carte. Actions et variantes disponibles.
          </Card>
        </div>
      );
    }
    if (component === "input") {
      return (
        <div style={{ padding: 16, maxWidth: 320 }}>
          <Input label="Champ texte" placeholder="Saisissez…" value={title} onChange={() => {}} />
        </div>
      );
    }
    if (component === "textarea") {
      return (
        <div style={{ padding: 16, maxWidth: 400 }}>
          <Textarea label="Zone de texte" placeholder="Contenu…" rows={4} value="" onChange={() => {}} />
        </div>
      );
    }
    if (component === "checkbox") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 12, flexDirection: "column" }}>
          <Checkbox label="Option A" checked={false} onChange={() => {}} />
          <Checkbox label="Option B" checked onChange={() => {}} />
        </div>
      );
    }
    if (component === "toggle") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <Toggle label="Activer" value={false} onChange={() => {}} />
          <Toggle label="Activé" value onChange={() => {}} />
        </div>
      );
    }
    if (component === "selectbox") {
      const options = [{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }, { value: "c", label: "Option C" }];
      return (
        <div style={{ padding: 16, maxWidth: 280 }}>
          <Selectbox label="Choix" options={options} value="a" onChange={() => {}} />
        </div>
      );
    }
    if (component === "accordion") {
      const sections = [
        { id: "1", title: "Section 1", content: "Contenu de la section 1." },
        { id: "2", title: "Section 2", content: "Contenu de la section 2." },
      ];
      return (
        <div style={{ padding: 16 }}>
          <Accordion sections={sections} allowMultiple />
        </div>
      );
    }
    if (component === "expander") {
      return (
        <div style={{ padding: 16 }}>
          <Expander title="Développer pour voir" defaultExpanded={false}>
            Contenu masqué par défaut.
          </Expander>
        </div>
      );
    }
    if (component === "avatar") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar size="small" name="AB" />
          <Avatar size="medium" name="CD" />
          <Avatar size="large" name="EF" />
        </div>
      );
    }
    if (component === "slider") {
      return (
        <div style={{ padding: 16, maxWidth: 320 }}>
          <Slider label="Volume" min={0} max={100} value={50} onChange={() => {}} />
        </div>
      );
    }
    if (component === "progress") {
      return (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <Progress value={30} max={100} label="Progression" showValue />
          <Progress value={70} max={100} label="Avancement" showValue />
        </div>
      );
    }
    if (component === "skeleton") {
      return (
        <div style={{ padding: 16 }}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" width="100%" height={80} className="mt-2" />
        </div>
      );
    }
    if (component === "breadcrumb") {
      const items = [{ href: "#", label: "Accueil" }, { href: "#", label: "Docs" }, { label: "Sandbox" }];
      return (
        <div style={{ padding: 16 }}>
          <Breadcrumb items={items} />
        </div>
      );
    }
    if (component === "divider") {
      return (
        <div style={{ padding: 16 }}>
          <p>Au-dessus</p>
          <Divider />
          <p>En dessous</p>
        </div>
      );
    }
    if (component === "emptystate") {
      return (
        <div style={{ padding: 16 }}>
          <EmptyState title="Aucun élément" description="La liste est vide pour le moment." />
        </div>
      );
    }
    if (component === "chip") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip label="Chip" />
          <Chip label="Primary" variant="primary" />
          <Chip label="Supprimable" onDelete={() => {}} />
        </div>
      );
    }
    if (component === "modal") {
      return (
        <div style={{ padding: 16 }}>
          <Modal isOpen={false} onClose={() => {}} title="Modal exemple" size="medium">
            Contenu du modal. Ouvrir via state pour tester.
          </Modal>
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Le modal est fermé ici ; à ouvrir via un bouton en contexte.</p>
        </div>
      );
    }
    if (component === "highlightbox") {
      return (
        <div style={{ padding: 16 }}>
          <HighlightBox value={1} label="Exemple" title="Encadré important" />
        </div>
      );
    }
    if (component === "stepper") {
      const steps = [{ id: "1", label: "Étape 1" }, { id: "2", label: "Étape 2" }, { id: "3", label: "Étape 3" }];
      return (
        <div style={{ padding: 16 }}>
          <Stepper steps={steps} currentStep={1} />
        </div>
      );
    }
    if (component === "markdown") {
      return (
        <div style={{ padding: 16 }}>
          <Markdown text="## Titre\n\nParagraphe avec **gras** et *italique*." />
        </div>
      );
    }
    if (component === "jsonviewer") {
      return (
        <div style={{ padding: 16 }}>
          <JsonViewer data={{ a: 1, b: "texte", c: [1, 2, 3] }} />
        </div>
      );
    }
    if (component === "empty") {
      return (
        <div style={{ padding: 16 }}>
          <Empty>Aucune donnée</Empty>
        </div>
      );
    }
    if (component === "grid") {
      return (
        <div style={{ padding: 16 }}>
          <Grid cols={3} gap={16}>
            <Column><Panel variant="info" title="Col 1">A</Panel></Column>
            <Column><Panel variant="info" title="Col 2">B</Panel></Column>
            <Column><Panel variant="info" title="Col 3">C</Panel></Column>
          </Grid>
        </div>
      );
    }
    if (component === "column") {
      return (
        <div style={{ padding: 16 }}>
          <Column><Panel variant="info" title="Colonne">Contenu dans une colonne.</Panel></Column>
        </div>
      );
    }
    if (component === "theme") {
      return (
        <div style={{ padding: 16 }}>
          <Theme variant="toggle" label="Thème" />
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Bascule clair / sombre.</p>
        </div>
      );
    }
    if (component === "container") {
      return (
        <div style={{ padding: 16 }}>
          <Container>
            <Panel variant="info" title="Contenu dans un container">Contenu.</Panel>
          </Container>
        </div>
      );
    }
    if (component === "statusbox") {
      return (
        <div style={{ padding: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatusBox state="complete" label="Succès" />
          <StatusBox state="running" label="En cours" />
          <StatusBox state="error" label="Erreur" />
        </div>
      );
    }
    if (component === "numberinput") {
      return (
        <div style={{ padding: 16, maxWidth: 160 }}>
          <NumberInput label="Quantité" value={42} min={0} max={100} onChange={() => {}} />
        </div>
      );
    }
    if (component === "dateinput") {
      return (
        <div style={{ padding: 16, maxWidth: 200 }}>
          <DateInput label="Date" value="" onChange={() => {}} />
        </div>
      );
    }
    if (component === "radiogroup") {
      const options = [{ value: "x", label: "Option X" }, { value: "y", label: "Option Y" }];
      return (
        <div style={{ padding: 16 }}>
          <RadioGroup name="demo" options={options} value="x" onChange={() => {}} label="Choix unique" />
        </div>
      );
    }
    if (component === "rating") {
      return (
        <div style={{ padding: 16 }}>
          <Rating value={3} max={5} onChange={() => {}} />
        </div>
      );
    }
    if (component === "fileuploader") {
      return (
        <div style={{ padding: 16, maxWidth: 400 }}>
          <FileUploader accept=".pdf,.doc" onFiles={() => {}} label="Fichier" />
        </div>
      );
    }
    if (component === "colorpicker") {
      return (
        <div style={{ padding: 16 }}>
          <ColorPicker label="Couleur" value="#3b82f6" onChange={() => {}} />
        </div>
      );
    }
    if (component === "linechart") {
      const data = [{ x: "Jan", y: 10 }, { x: "Fév", y: 20 }, { x: "Mar", y: 15 }];
      return (
        <div style={{ padding: 16, height: 200 }}>
          <LineChart data={data} width={400} height={180} />
        </div>
      );
    }
    if (component === "barchart") {
      const data = [{ x: "A", y: 30 }, { x: "B", y: 45 }, { x: "C", y: 25 }];
      return (
        <div style={{ padding: 16, height: 200 }}>
          <BarChart data={data} width={400} height={180} />
        </div>
      );
    }
    if (component === "areachart") {
      const data = [{ x: "Jan", y: 10 }, { x: "Fév", y: 25 }, { x: "Mar", y: 18 }];
      return (
        <div style={{ padding: 16, height: 200 }}>
          <AreaChart data={data} width={400} height={180} />
        </div>
      );
    }
    if (component === "scatterchart") {
      const data = [{ x: 10, y: 20 }, { x: 30, y: 40 }, { x: 50, y: 35 }, { x: 70, y: 60 }];
      return (
        <div style={{ padding: 16, height: 200 }}>
          <ScatterChart data={data} width={400} height={180} />
        </div>
      );
    }
    if (component === "video") {
      return (
        <div style={{ padding: 16, maxWidth: 400 }}>
          <Video src="https://www.w3schools.com/html/mov_bbb.mp4" controls />
        </div>
      );
    }
    if (component === "audio") {
      return (
        <div style={{ padding: 16 }}>
          <Audio src="https://www.w3schools.com/html/horse.mp3" controls />
        </div>
      );
    }
    if (component === "topnav") {
      const items = [{ label: "Accueil", href: "/" }, { label: "Sandbox", href: "/sandbox" }, { label: "Docs", href: "/docs" }];
      return (
        <div style={{ padding: 0 }}>
          <TopNav title="Blueprint Modular" titleHref="/" items={items} />
        </div>
      );
    }
    if (component === "fab") {
      return (
        <div style={{ padding: 16, minHeight: 200, position: "relative" }}>
          <FAB icon="+" label="Action" onClick={() => window.alert("FAB cliqué")} position="bottom-right" />
        </div>
      );
    }
    if (component === "treeview") {
      const nodes = [
        { id: "1", label: "Racine", defaultOpen: true, children: [
          { id: "1-1", label: "Enfant 1" },
          { id: "1-2", label: "Enfant 2", children: [{ id: "1-2-1", label: "Sous-enfant" }] },
        ]},
        { id: "2", label: "Autre nœud" },
      ];
      return (
        <div style={{ padding: 16, maxWidth: 320 }}>
          <Treeview nodes={nodes} selectedId={null} onSelect={() => {}} />
        </div>
      );
    }
    if (component === "timeline") {
      const timelineItems = [
        { title: "Étape 1", description: "Terminée", date: "Jan 2025", status: "done" as const },
        { title: "Étape 2", description: "En cours", date: "Fév 2025", status: "current" as const },
        { title: "Étape 3", description: "À venir", date: "Mar 2025", status: "upcoming" as const },
      ];
      return (
        <div style={{ padding: 16 }}>
          <Timeline items={timelineItems} />
        </div>
      );
    }
    if (component === "image") {
      return (
        <div style={{ padding: 16 }}>
          <div style={{ width: 300, height: 200, border: "1px solid var(--bpm-border)" }}>
            <Image src="https://picsum.photos/400/300" alt="Exemple" fit="contain" width={300} height={200} />
          </div>
        </div>
      );
    }
    if (component === "pdf") {
      return (
        <div style={{ padding: 16 }}>
          <PdfViewer src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" height={400} />
        </div>
      );
    }
    if (component === "autocomplete") {
      const opts = [{ value: "paris", label: "Paris" }, { value: "lyon", label: "Lyon" }, { value: "marseille", label: "Marseille" }];
      return (
        <div style={{ padding: 16, maxWidth: 280 }}>
          <Autocomplete options={opts} value="" onChange={() => {}} placeholder="Rechercher une ville…" />
        </div>
      );
    }
    if (component === "plotly") {
      return (
        <div style={{ padding: 16 }}>
          <PlotlyChart width={400} height={300} />
        </div>
      );
    }
    if (component === "map") {
      return (
        <div style={{ padding: 16 }}>
          <Map lat={48.8566} lng={2.3522} width={400} height={300} />
        </div>
      );
    }
    if (component === "altair") {
      return (
        <div style={{ padding: 16 }}>
          <AltairChart width={400} height={300} />
        </div>
      );
    }
    return (
      <Panel variant="info" title="Sandbox BPM">
        <p>Composant : <code>{component}</code></p>
        <p>Sélectionnez un composant dans la liste ou utilisez <code>?component=...</code>.</p>
        <p><code>?variant=warning</code>, <code>?title=Mon titre</code>, <code>?theme=dark</code>.</p>
      </Panel>
    );
  }, [component, variant, title, value, label, tableSelectedRow]);

  const hasVariant = component === "panel" || component === "message";
  const hasTitle = component === "panel" || component === "message";

  const generateFromAI = useCallback(async () => {
    if (!aiDescription.trim() || aiGenerating) return;
    setAiGenerating(true);
    setAiError(null);
    setCode("# Génération en cours…");

    try {
      const res = await fetch("/api/sandbox/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDescription }),
        credentials: "include",
      });

      if (!res.ok) {
        setAiError(`Erreur ${res.status}`);
        setCode("");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; t?: string; message?: string };
              if (data.type === "chunk" && data.t) {
                full += data.t;
                // Filtre les lignes non-bpm en temps réel
                const validLines = full
                  .split("\n")
                  .filter((l) => l.trim().startsWith("bpm.") || l.trim() === "" || l.trim().startsWith("#"))
                  .join("\n");
                setCode(validLines);
              }
              if (data.type === "error") {
                setAiError(data.message ?? "Erreur inconnue");
              }
            } catch { /* ignore */ }
          }
        }
      }
      // Bascule automatiquement en mode code pour voir le résultat
      setMode("code");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Erreur réseau");
      setCode("");
    } finally {
      setAiGenerating(false);
    }
  }, [aiDescription, aiGenerating]);

  return (
    <div
      className={isDark ? "theme-dark" : ""}
      style={{
        minHeight: "100%",
        background: "var(--bpm-bg-secondary, #f5f5f5)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div className="doc-page w-full">
        <div className="doc-page-header">
          <h1>Sandbox</h1>
          <p className="doc-description">
            Choisissez un composant ou écrivez du code pour composer une page en direct.
          </p>
          <div className="mt-4 p-4 rounded-lg border" style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Modules de l&apos;app</p>
            <div className="flex flex-wrap gap-2">
              {SANDBOX_MODULES.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition"
                  style={{
                    background: "var(--bpm-bg-secondary)",
                    color: "var(--bpm-accent-cyan)",
                    border: "1px solid var(--bpm-border)",
                    textDecoration: "none",
                  }}
                >
                  {mod.label}
                </Link>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
              {SANDBOX_MODULES.map((m) => m.label).join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("code")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
            style={{
              background: mode === "code" ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-primary)",
              color: mode === "code" ? "#fff" : "var(--bpm-text-primary)",
              border: "1px solid var(--bpm-border)",
            }}
          >
            Par code
          </button>
          <button
            type="button"
            onClick={() => setMode("selector")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
            style={{
              background: mode === "selector" ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-primary)",
              color: mode === "selector" ? "#fff" : "var(--bpm-text-primary)",
              border: "1px solid var(--bpm-border)",
            }}
          >
            Par composant
          </button>
          <button
            type="button"
            onClick={() => setMode("ai")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
            style={{
              background: mode === "ai" ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-primary)",
              color: mode === "ai" ? "#fff" : "var(--bpm-text-primary)",
              border: "1px solid var(--bpm-border)",
            }}
          >
            ✦ Par IA
          </button>
        </div>

        {mode === "code" && (
          <>
            <div
              className="rounded-lg border mb-4 relative"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
              }}
            >
              <label className="block text-xs font-semibold p-3 pb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                Code (appels bpm.*)
              </label>
              <div className="relative">
                <textarea
                  ref={codeInputRef}
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={handleCodeKeyDown}
                  onBlur={() => setTimeout(() => setCompletionOpen(false), 150)}
                  placeholder={DEFAULT_CODE}
                  spellCheck={false}
                  className="w-full p-3 pt-1 font-mono text-sm rounded-t-lg resize-y min-h-[180px] focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--bpm-code-bg, #f5f5f5)",
                    borderColor: "var(--bpm-border)",
                    color: "var(--bpm-text-primary)",
                  }}
                  rows={10}
                />
                {completionOpen && completionList.length > 0 && (
                  <ul
                    className="absolute left-0 right-0 z-10 max-h-[200px] overflow-y-auto rounded-b-lg border border-t-0 shadow-lg py-1 list-none m-0"
                    style={{
                      top: "100%",
                      background: "var(--bpm-bg-primary)",
                      borderColor: "var(--bpm-border)",
                    }}
                  >
                    {completionList.map((item, i) => (
                      <li
                        key={item.value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyCompletion(item.value);
                        }}
                        className="px-3 py-1.5 cursor-pointer font-mono text-sm"
                        style={{
                          background: i === completionIndex ? "var(--bpm-accent-cyan)" : "transparent",
                          color: i === completionIndex ? "#fff" : "var(--bpm-text-primary)",
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs px-3 pb-3 pt-2" style={{ color: "var(--bpm-text-secondary)" }}>
                Tapez <code>bpm.</code> pour l&apos;autocomplétion. Exemples : bpm.title(...), bpm.metric(...), bpm.barchart(...).
              </p>
            </div>
            <div
              className="rounded-lg border p-4 mb-6"
              style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
                Aperçu en direct
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {parseCodeToPreview(code).length ? (
                  parseCodeToPreview(code).map((node, i) => <React.Fragment key={i}>{node}</React.Fragment>)
                ) : (
                  <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                    Écrivez des appels bpm.* ci-dessus pour voir le rendu ici.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {mode === "selector" && (
          <>
        <div
          className="flex flex-wrap gap-4 p-4 rounded-lg border mb-6"
          style={{
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Composant
            </label>
            <select
              value={SANDBOX_COMPONENTS.some((c) => c.value === component) ? component : "panel"}
              onChange={(e) => setParams({ component: e.target.value })}
              className="px-3 py-2 rounded-lg border text-sm min-w-[160px]"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
                color: "var(--bpm-text-primary)",
              }}
            >
              {SANDBOX_COMPONENTS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {hasVariant && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                Variante
              </label>
              <select
                value={variant}
                onChange={(e) => setParams({ variant: e.target.value })}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{
                  background: "var(--bpm-bg-primary)",
                  borderColor: "var(--bpm-border)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                <option value="info">info</option>
                <option value="success">success</option>
                <option value="warning">warning</option>
                <option value="error">error</option>
              </select>
            </div>
          )}
          {hasTitle && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
                Titre
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setParams({ title: e.target.value })}
                placeholder="Optionnel"
                className="px-3 py-2 rounded-lg border text-sm min-w-[120px]"
                style={{
                  background: "var(--bpm-bg-primary)",
                  borderColor: "var(--bpm-border)",
                  color: "var(--bpm-text-primary)",
                }}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Thème
            </label>
            <select
              value={theme}
              onChange={(e) => setParams({ theme: e.target.value })}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                background: "var(--bpm-bg-primary)",
                borderColor: "var(--bpm-border)",
                color: "var(--bpm-text-primary)",
              }}
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
        </div>
        <div className="rounded-lg border p-4" style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}>
          {content}
        </div>
          </>
        )}

        {mode === "ai" && (
          <div
            className="rounded-lg border p-4 mb-4"
            style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
          >
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: "var(--bpm-text-secondary)" }}
            >
              Décrivez la page que vous voulez générer
            </label>
            <textarea
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  generateFromAI();
                }
              }}
              placeholder={
                "Exemples :\n" +
                "• Un dashboard avec le CA mensuel, le taux de marge et un graphique de tendance\n" +
                "• Une page de suivi de contrats avec statut et date d'échéance\n" +
                "• Un formulaire de saisie de commande fournisseur"
              }
              rows={4}
              className="w-full rounded border px-3 py-2 text-sm resize-none mb-3"
              style={{
                borderColor: "var(--bpm-border)",
                background: "var(--bpm-bg-secondary)",
                color: "var(--bpm-text-primary)",
              }}
            />
            {aiError && (
              <p className="text-sm mb-3" style={{ color: "var(--bpm-accent)" }}>
                ⚠ {aiError}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={generateFromAI}
                disabled={aiGenerating || !aiDescription.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{
                  background: aiGenerating || !aiDescription.trim()
                    ? "var(--bpm-border)"
                    : "var(--bpm-accent-cyan)",
                  color: aiGenerating || !aiDescription.trim()
                    ? "var(--bpm-text-secondary)"
                    : "#fff",
                  cursor: aiGenerating || !aiDescription.trim() ? "not-allowed" : "pointer",
                }}
              >
                {aiGenerating ? "Génération…" : "✦ Générer"}
              </button>
              {aiGenerating && (
                <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                  Qwen2.5 génère votre page (~30-60s)…
                </span>
              )}
              {!aiGenerating && (
                <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                  Cmd+Entrée pour lancer · Le résultat s&apos;ouvrira en mode &quot;Par code&quot;
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sandbox BPM — Visuel d'un composant BPM (avec sidebar app).
 * Usage : /sandbox?component=panel&variant=warning&title=Test
 * Embed iframe depuis la doc statique : app.blueprint-modular.com/sandbox?component=...
 */
export default function SandboxPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bpm-bg-secondary)", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>Chargement…</div>}>
      <SandboxContent />
    </Suspense>
  );
}
