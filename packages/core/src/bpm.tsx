/**
 * @blueprint-modular/core — objet bpm unifié.
 * Réexporte tous les composants de components/bpm (sauf Title, Page, Chat gardés locaux).
 * Build : depuis la racine du repo, avec alias @ → repo root.
 */
import React from "react";

import { Button } from "./components/Button";
import {
  Accordion,
  AltairChart,
  AreaChart,
  Audio,
  Autocomplete,
  Avatar,
  Badge,
  BarChart,
  Barcode,
  Breadcrumb,
  Caption,
  Card,
  Checkbox,
  Chip,
  ChatInterface,
  CodeBlock,
  CodeEditor,
  ConfirmModal,
  CrudPage,
  ColorPicker,
  Column,
  Container,
  DataExplorer,
  DateInput,
  DateRangePicker,
  DiffViewer,
  Divider,
  Drawer,
  Empty,
  EmptyState,
  Expander,
  FAB,
  FilePreview,
  FileUploader,
  FilterPanel,
  Gps,
  Grid,
  HighlightBox,
  Html,
  Image,
  Input,
  JsonEditor,
  JsonViewer,
  LabelValue,
  LineChart,
  LoadingBar,
  Map,
  Markdown,
  Message,
  Metric,
  MetricRow,
  ModelSelector,
  Modal,
  NotificationCenter,
  NumberInput,
  NfcBadge,
  Pagination,
  Panel,
  PageLayout,
  PdfViewer,
  PlotlyChart,
  Popover,
  Progress,
  PromptInput,
  QRCode,
  RadioGroup,
  Rating,
  ScatterChart,
  ScrollContainer,
  Selectbox,
  Skeleton,
  Slider,
  Spinner,
  SpinnerDot,
  StatusBox,
  Stepper,
  StreamingText,
  Table,
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
export type { TabsProps, TabItem, TabsItems } from "../../../components/bpm/Tabs";
import type { TabsItems } from "../../../components/bpm/Tabs";
export type { MetricProps as MetricPropsBpm } from "../../../components/bpm/Metric";
import type { MetricRowProps } from "../../../components/bpm";
import type { SpinnerProps } from "../../../components/bpm/Spinner";
export type { SpinnerProps as SpinnerPropsBpm, SpinnerSize } from "../../../components/bpm/Spinner";

/** Colonne pour bpm.table — API documentée (renderCell aligné avec Table.tsx render). */
export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "badge" | "boolean";
  sortable?: boolean;
  renderCell?: (value: unknown, row?: unknown) => React.ReactNode;
}

/** Wrapper : (props) => createElement(Component, props) — API toujours en objet */
function wrap<P extends object>(Component: React.ComponentType<P>) {
  return (props: P) => React.createElement(Component, props);
}

// --- Types locaux (Page, Title, Chat) — API explicite en objet ---

export interface PageProps {
  children: React.ReactNode;
}

export interface TitleProps {
  children: React.ReactNode;
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
  metricRow: wrap<MetricRowProps>(MetricRow),
  metric: wrap(Metric),
  table: wrap(Table),
  chat: wrap<ChatProps>(Chat),
  accordion: wrap(Accordion),
  altairChart: wrap(AltairChart),
  areaChart: wrap(AreaChart),
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
  chatInterface: wrap(ChatInterface),
  codeBlock: wrap(CodeBlock),
  codeEditor: wrap(CodeEditor),
  confirmModal: wrap(ConfirmModal),
  crud: wrap(CrudPage),
  colorPicker: wrap(ColorPicker),
  column: wrap(Column),
  container: wrap(Container),
  dataExplorer: wrap(DataExplorer),
  dateInput: wrap(DateInput),
  dateRangePicker: wrap(DateRangePicker),
  diffViewer: wrap(DiffViewer),
  divider: wrap(Divider),
  drawer: wrap(Drawer),
  empty: wrap(Empty),
  emptyState: wrap(EmptyState),
  expander: wrap(Expander),
  fab: wrap(FAB),
  filePreview: wrap(FilePreview),
  fileUploader: wrap(FileUploader),
  filterPanel: wrap(FilterPanel),
  grid: wrap(Grid),
  gps: wrap(Gps),
  highlightBox: wrap(HighlightBox),
  html: wrap(Html),
  image: wrap(Image),
  input: wrap(Input),
  jsonEditor: wrap(JsonEditor),
  jsonViewer: wrap(JsonViewer),
  labelValue: wrap(LabelValue),
  lineChart: wrap(LineChart),
  loadingBar: wrap(LoadingBar),
  map: wrap(Map),
  markdown: wrap(Markdown),
  message: wrap(Message),
  modelSelector: wrap(ModelSelector),
  modal: wrap(Modal),
  notificationCenter: wrap(NotificationCenter),
  numberInput: wrap(NumberInput),
  nfcBadge: wrap(NfcBadge),
  pagination: wrap(Pagination),
  panel: wrap(Panel),
  pageLayout: wrap(PageLayout),
  pdfViewer: wrap(PdfViewer),
  plotlyChart: wrap(PlotlyChart),
  popover: wrap(Popover),
  progress: wrap(Progress),
  promptInput: wrap(PromptInput),
  qrCode: wrap(QRCode),
  radioGroup: wrap(RadioGroup),
  rating: wrap(Rating),
  scatterChart: wrap(ScatterChart),
  scrollContainer: wrap(ScrollContainer),
  selectbox: wrap(Selectbox),
  skeleton: wrap(Skeleton),
  slider: wrap(Slider),
  spinner: (arg?: SpinnerProps) => React.createElement(Spinner, arg ?? {}),
  spinnerDot: wrap(SpinnerDot),
  statusBox: wrap(StatusBox),
  stepper: wrap(Stepper),
  streamingText: wrap(StreamingText),
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
