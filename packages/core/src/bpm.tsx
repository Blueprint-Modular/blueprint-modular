/**
 * @blueprint-modular/core — objet bpm unifié.
 * Réexporte tous les composants de components/bpm (sauf Metric, Table, Title, Page, Chat gardés locaux).
 * Build : depuis la racine du repo, avec alias @ → repo root.
 */
import React from "react";

import {
  Accordion,
  AltairChart,
  AreaChart,
  AssistantPanel,
  Audio,
  Autocomplete,
  Avatar,
  Badge,
  BarChart,
  Barcode,
  Breadcrumb,
  Button,
  Caption,
  Card,
  Checkbox,
  Chip,
  CodeBlock,
  CrudPage,
  ColorPicker,
  Column,
  Container,
  DateInput,
  DateRangePicker,
  Divider,
  Drawer,
  Empty,
  EmptyState,
  Expander,
  FAB,
  FileUploader,
  Grid,
  HighlightBox,
  Html,
  Image,
  Input,
  JsonViewer,
  LineChart,
  LoadingBar,
  Map,
  Markdown,
  Message,
  MetricRow,
  Modal,
  NumberInput,
  NfcBadge,
  OfflineIndicator,
  Pagination,
  Panel,
  PdfViewer,
  PlotlyChart,
  Popover,
  Progress,
  QRCode,
  RadioGroup,
  Rating,
  ScatterChart,
  Selectbox,
  Skeleton,
  Slider,
  Spinner,
  SpinnerDot,
  StatusBox,
  Stepper,
  Tabs,
  Text,
  Textarea,
  Theme,
  TimeInput,
  Timeline,
  Title as TitleBpm,
  Title1,
  Title2,
  Title3,
  Title4,
  Toggle,
  Toast,
  Tooltip,
  TopNav,
  Treeview,
  Video,
} from "../../../components/bpm";

export type { CrudPageProps, CrudColumn, CrudField } from "../../../components/bpm";
export type { MetricRowProps } from "../../../components/bpm";
export type { TableProps as TablePropsBpm } from "../../../components/bpm/Table";

/** Colonne pour bpm.table — API documentée. */
export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "badge" | "boolean";
  sortable?: boolean;
}
export type { TabsProps, TabItem, TabsItems } from "../../../components/bpm/Tabs";
import type { TabsItems } from "../../../components/bpm/Tabs";
export type { MetricProps as MetricPropsBpm } from "../../../components/bpm/Metric";
import type { MetricRowProps } from "../../../components/bpm";
import type { SpinnerProps } from "../../../components/bpm/Spinner";
export type { SpinnerProps as SpinnerPropsBpm, SpinnerSize } from "../../../components/bpm/Spinner";

/** Wrapper : (props) => createElement(Component, props) — API toujours en objet */
function wrap<P extends object>(Component: React.ComponentType<P>) {
  return (props: P) => React.createElement(Component, props);
}

// --- Types locaux (Page, Title, Metric, Table, Chat) — API explicite en objet ---

export interface PageProps {
  children: React.ReactNode;
}

export interface TitleProps {
  children: React.ReactNode;
}

export interface MetricProps {
  label: string;
  value: number | string;
  delta?: number | string;
  semantic?: string;
  domain?: string;
  threshold?: number;
  unit?: string;
  direction?: "higher_is_better" | "lower_is_better";
}

export interface TableProps {
  columns?: TableColumn[];
  data: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  searchable?: boolean;
  pagination?: boolean;
  semantic?: string;
  domain?: string;
}

interface ChatProps {
  model?: string;
  placeholder?: string;
}

// --- Composants locaux (implémentation actuelle conservée) ---

function Page({ children }: PageProps) {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      {children}
    </div>
  );
}

function Title({ children }: TitleProps) {
  return (
    <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>
      {children}
    </h1>
  );
}

function Metric({
  label,
  value,
  delta,
}: MetricProps) {
  const isPositive = delta !== undefined && Number(delta) >= 0;
  return (
    <div
      style={{
        display: "inline-block",
        padding: "1rem 1.5rem",
        margin: "0.5rem",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
      {delta !== undefined && (
        <div
          style={{
            fontSize: "0.85rem",
            color: isPositive ? "#16a34a" : "#dc2626",
          }}
        >
          {isPositive ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}

function Table({ data, columns: _columns }: TableProps) {
  if (!data?.length) return null;
  const keys = Object.keys(data[0]);
  const cols = _columns?.length
    ? _columns.map((c) => ({ key: c.key, label: c.label ?? c.key }))
    : keys.map((key) => ({ key, label: key }));
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        margin: "1rem 0",
      }}
    >
      <thead>
        <tr>
          {cols.map((c) => (
            <th
              key={c.key}
              style={{
                textAlign: "left",
                padding: "0.5rem 0.75rem",
                background: "#f1f5f9",
                borderBottom: "2px solid #e2e8f0",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
            {cols.map((c) => (
              <td
                key={c.key}
                style={{
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.9rem",
                }}
              >
                {String(row[c.key] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Chat({
  model = "llama3.2",
  placeholder = "Posez votre question...",
}: ChatProps) {
  const [messages, setMessages] = React.useState<
    { role: string; content: string }[]
  >([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: newMessages, stream: false }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.message.content },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "❌ Ollama non disponible. Lancez : bpm setup",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        overflow: "hidden",
        margin: "1rem 0",
      }}
    >
      <div
        style={{
          background: "#1e40af",
          color: "#fff",
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
          fontWeight: 600,
        }}
      >
        💬 Chat IA — {model}
      </div>
      <div
        style={{
          minHeight: 120,
          maxHeight: 320,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: "0.75rem",
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.9rem",
                background: m.role === "user" ? "#1e40af" : "#f1f5f9",
                color: m.role === "user" ? "#fff" : "#1e293b",
                maxWidth: "80%",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            ⏳ Génération...
          </div>
        )}
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #e2e8f0" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            border: "none",
            outline: "none",
            fontSize: "0.9rem",
          }}
        />
        <button
          onClick={send}
          style={{
            padding: "0.75rem 1.25rem",
            background: "#1e40af",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

/** Normalise page(arg) : accepte { children } ou children directement (rétrocompat) */
function normalizePageArg(arg: PageProps | React.ReactNode): PageProps {
  if (arg !== null && typeof arg === "object" && !React.isValidElement(arg) && "children" in arg) {
    return arg as PageProps;
  }
  return { children: arg as React.ReactNode };
}

/** Normalise tabs(arg) : accepte { tabs, defaultTab? } ou tableau (rétrocompat) */
function normalizeTabsArg(
  arg: React.ComponentProps<typeof Tabs> | TabsItems
): React.ComponentProps<typeof Tabs> {
  if (Array.isArray(arg)) {
    return { tabs: arg };
  }
  if (arg !== null && typeof arg === "object" && "tabs" in arg) {
    return arg as React.ComponentProps<typeof Tabs>;
  }
  return { tabs: [] };
}

// --- Export bpm unifié : API toujours (props: objet) => ReactNode ---
export const bpm = {
  page: (arg: PageProps | React.ReactNode) => React.createElement(Page, normalizePageArg(arg)),
  title: wrap<TitleProps>(Title),
  title1: wrap(Title1),
  title2: wrap(Title2),
  title3: wrap(Title3),
  title4: wrap(Title4),
  metric: wrap<MetricProps>(Metric),
  metricRow: wrap<MetricRowProps>(MetricRow),
  table: wrap<TableProps>(Table),
  chat: wrap<ChatProps>(Chat),
  accordion: wrap(Accordion),
  altairChart: wrap(AltairChart),
  areaChart: wrap(AreaChart),
  assistantPanel: wrap(AssistantPanel),
  audio: wrap(Audio),
  autocomplete: wrap(Autocomplete),
  avatar: wrap(Avatar),
  badge: wrap(Badge),
  barChart: wrap(BarChart),
  barcode: wrap(Barcode),
  breadcrumb: wrap(Breadcrumb),
  button: wrap(Button),
  caption: wrap(Caption),
  card: wrap(Card),
  checkbox: wrap(Checkbox),
  chip: wrap(Chip),
  codeBlock: wrap(CodeBlock),
  crud: wrap(CrudPage),
  colorPicker: wrap(ColorPicker),
  column: wrap(Column),
  container: wrap(Container),
  dateInput: wrap(DateInput),
  dateRangePicker: wrap(DateRangePicker),
  divider: wrap(Divider),
  drawer: wrap(Drawer),
  empty: wrap(Empty),
  emptyState: wrap(EmptyState),
  expander: wrap(Expander),
  fab: wrap(FAB),
  fileUploader: wrap(FileUploader),
  grid: wrap(Grid),
  highlightBox: wrap(HighlightBox),
  html: wrap(Html),
  image: wrap(Image),
  input: wrap(Input),
  jsonViewer: wrap(JsonViewer),
  lineChart: wrap(LineChart),
  loadingBar: wrap(LoadingBar),
  map: wrap(Map),
  markdown: wrap(Markdown),
  message: wrap(Message),
  modal: wrap(Modal),
  numberInput: wrap(NumberInput),
  nfcBadge: wrap(NfcBadge),
  offlineIndicator: wrap(OfflineIndicator),
  pagination: wrap(Pagination),
  panel: wrap(Panel),
  pdfViewer: wrap(PdfViewer),
  plotlyChart: wrap(PlotlyChart),
  popover: wrap(Popover),
  progress: wrap(Progress),
  qrCode: wrap(QRCode),
  radioGroup: wrap(RadioGroup),
  rating: wrap(Rating),
  scatterChart: wrap(ScatterChart),
  selectbox: wrap(Selectbox),
  skeleton: wrap(Skeleton),
  slider: wrap(Slider),
  spinner: (arg?: SpinnerProps) => React.createElement(Spinner, arg ?? {}),
  spinnerDot: wrap(SpinnerDot),
  statusBox: wrap(StatusBox),
  stepper: wrap(Stepper),
  tabs: (arg: React.ComponentProps<typeof Tabs> | TabsItems) =>
    React.createElement(Tabs, normalizeTabsArg(arg)),
  text: wrap(Text),
  textarea: wrap(Textarea),
  theme: wrap(Theme),
  timeInput: wrap(TimeInput),
  timeline: wrap(Timeline),
  toast: wrap(Toast),
  tooltip: wrap(Tooltip),
  topNav: wrap(TopNav),
  treeview: wrap(Treeview),
  video: wrap(Video),
  titleBpm: wrap(TitleBpm),
};
