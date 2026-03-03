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

// --- Types locaux (Page, Title, Metric, Table, Chat) avec props sémantiques optionnelles ---

interface PageProps {
  children: React.ReactNode;
}

interface TitleProps {
  children: React.ReactNode;
}

interface MetricProps {
  label: string;
  value: number | string;
  delta?: number | string;
  /** Sémantique Mind v0 — optionnel */
  semantic?: string;
  domain?: string;
  threshold?: number;
  unit?: string;
  direction?: "higher_is_better" | "lower_is_better";
}

interface TableProps {
  data: Record<string, unknown>[];
  /** Sémantique Mind v0 — optionnel */
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

function Table({ data }: TableProps) {
  if (!data?.length) return null;
  const cols = Object.keys(data[0]);
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
              key={c}
              style={{
                textAlign: "left",
                padding: "0.5rem 0.75rem",
                background: "#f1f5f9",
                borderBottom: "2px solid #e2e8f0",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
            {cols.map((c) => (
              <td
                key={c}
                style={{
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.9rem",
                }}
              >
                {String(row[c] ?? "")}
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

// --- Export bpm unifié (70 composants) ---
export const bpm = {
  page: Page,
  title: Title,
  title1: Title1,
  title2: Title2,
  title3: Title3,
  title4: Title4,
  metric: Metric,
  table: Table,
  chat: Chat,
  accordion: Accordion,
  altairChart: AltairChart,
  areaChart: AreaChart,
  assistantPanel: AssistantPanel,
  audio: Audio,
  autocomplete: Autocomplete,
  avatar: Avatar,
  badge: Badge,
  barChart: BarChart,
  barcode: Barcode,
  breadcrumb: Breadcrumb,
  button: Button,
  caption: Caption,
  card: Card,
  checkbox: Checkbox,
  chip: Chip,
  codeBlock: CodeBlock,
  colorPicker: ColorPicker,
  column: Column,
  container: Container,
  dateInput: DateInput,
  dateRangePicker: DateRangePicker,
  divider: Divider,
  drawer: Drawer,
  empty: Empty,
  emptyState: EmptyState,
  expander: Expander,
  fab: FAB,
  fileUploader: FileUploader,
  grid: Grid,
  highlightBox: HighlightBox,
  html: Html,
  image: Image,
  input: Input,
  jsonViewer: JsonViewer,
  lineChart: LineChart,
  loadingBar: LoadingBar,
  map: Map,
  markdown: Markdown,
  message: Message,
  modal: Modal,
  numberInput: NumberInput,
  nfcBadge: NfcBadge,
  offlineIndicator: OfflineIndicator,
  pagination: Pagination,
  panel: Panel,
  pdfViewer: PdfViewer,
  plotlyChart: PlotlyChart,
  popover: Popover,
  progress: Progress,
  qrCode: QRCode,
  radioGroup: RadioGroup,
  rating: Rating,
  scatterChart: ScatterChart,
  selectbox: Selectbox,
  skeleton: Skeleton,
  slider: Slider,
  spinner: Spinner,
  spinnerDot: SpinnerDot,
  statusBox: StatusBox,
  stepper: Stepper,
  tabs: Tabs,
  text: Text,
  textarea: Textarea,
  theme: Theme,
  timeInput: TimeInput,
  timeline: Timeline,
  toast: Toast,
  tooltip: Tooltip,
  topNav: TopNav,
  treeview: Treeview,
  video: Video,
  // Title export from bpm (alias pour usage avancé)
  titleBpm: TitleBpm,
};
