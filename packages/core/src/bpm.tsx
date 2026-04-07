/**
 * @blueprint-modular/core — objet bpm unifié.
 * Réexporte tous les composants de components/bpm (sauf Title, Page, Chat gardés locaux).
 * Build : depuis la racine du repo, avec alias @ → repo root.
 */
import React from "react";

import { Button } from "./components/Button";
import {
  Accordion,
  ActivityFeed,
  AddressInput,
  AIQueryBar,
  AlarmPanel,
  AltairChart,
  AnomalyAlert,
  ApprovalFlow,
  AreaChart,
  Audio,
  Autocomplete,
  Avatar,
  Badge,
  BarChart,
  Barcode,
  Breadcrumb,
  Breadcrumbs,
  Caption,
  Card,
  Changelog,
  ChatInterface,
  Checkbox,
  Chip,
  CodeBlock,
  CodeEditor,
  CommentThread,
  Comparison,
  ConfirmModal,
  ContextMenu,
  CrudPage,
  ColorPicker,
  Column,
  CommandPalette,
  Container,
  DataExplorer,
  DateInput,
  DateRangePicker,
  DecisionTree,
  DiffViewer,
  Divider,
  Drawer,
  DrillDown,
  EmailComposer,
  Empty,
  EmptyState,
  Expander,
  ExportButton,
  FAB,
  FilePreview,
  FileUploader,
  FilterPanel,
  FlowDiagram,
  FunnelChart,
  Gantt,
  Geofence,
  Gps,
  Grid,
  GroupedList,
  Heatmap,
  HighlightBox,
  Html,
  Image,
  InlineEdit,
  Input,
  InvoiceTemplate,
  JsonEditor,
  JsonViewer,
  LabelValue,
  LineChart,
  LiveChart,
  LiveGauge,
  LoadingBar,
  MachineStatus,
  Map,
  MapView,
  Markdown,
  MasterDetail,
  Message,
  Metric,
  MetricRow,
  ModelSelector,
  Modal,
  NotificationCenter,
  NumberInput,
  NfcBadge,
  OrgChart,
  Pagination,
  Panel,
  PageLayout,
  PdfViewer,
  PivotTable,
  PLCConnector,
  PlotlyChart,
  Popover,
  PredictiveChart,
  PrintLayout,
  Progress,
  ProgressRing,
  PromptInput,
  QRCode,
  RadarChart,
  RadioGroup,
  Rating,
  RelationGraph,
  ReportPage,
  RichTextEditor,
  RoutePlanner,
  ScatterChart,
  ScrollContainer,
  Scheduler,
  Selectbox,
  SensorGrid,
  SignaturePad,
  Skeleton,
  Slider,
  Sparkline,
  SplitView,
  Spinner,
  SpinnerDot,
  StateMachine,
  StatusBox,
  StatusTracker,
  Stepper,
  StreamingText,
  SuggestionCard,
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
  Tour,
  Treeview,
  Treemap,
  Video,
  Waterfall,
  WizardForm,
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
  activityFeed: wrap(ActivityFeed),
  addressInput: wrap(AddressInput),
  aiQueryBar: wrap(AIQueryBar),
  alarmPanel: wrap(AlarmPanel),
  altairChart: wrap(AltairChart),
  anomalyAlert: wrap(AnomalyAlert),
  approvalFlow: wrap(ApprovalFlow),
  areaChart: wrap(AreaChart),
  audio: wrap(Audio),
  autocomplete: wrap(Autocomplete),
  avatar: wrap(Avatar),
  badge: wrap(Badge),
  barChart: wrap(BarChart),
  barcode: wrap(Barcode),
  breadcrumb: wrap(Breadcrumb),
  breadcrumbs: wrap(Breadcrumbs),
  button: wrap(Button),
  caption: wrap(Caption),
  card: wrap(Card),
  changelog: wrap(Changelog),
  checkbox: wrap(Checkbox),
  chip: wrap(Chip),
  chatInterface: wrap(ChatInterface),
  codeBlock: wrap(CodeBlock),
  codeEditor: wrap(CodeEditor),
  commentThread: wrap(CommentThread),
  comparison: wrap(Comparison),
  confirmModal: wrap(ConfirmModal),
  contextMenu: wrap(ContextMenu),
  crud: wrap(CrudPage),
  colorPicker: wrap(ColorPicker),
  column: wrap(Column),
  commandPalette: wrap(CommandPalette),
  container: wrap(Container),
  dataExplorer: wrap(DataExplorer),
  dateInput: wrap(DateInput),
  dateRangePicker: wrap(DateRangePicker),
  decisionTree: wrap(DecisionTree),
  diffViewer: wrap(DiffViewer),
  divider: wrap(Divider),
  drawer: wrap(Drawer),
  drillDown: wrap(DrillDown),
  emailComposer: wrap(EmailComposer),
  empty: wrap(Empty),
  emptyState: wrap(EmptyState),
  expander: wrap(Expander),
  exportButton: wrap(ExportButton),
  fab: wrap(FAB),
  filePreview: wrap(FilePreview),
  fileUploader: wrap(FileUploader),
  filterPanel: wrap(FilterPanel),
  flowDiagram: wrap(FlowDiagram),
  funnelChart: wrap(FunnelChart),
  gantt: wrap(Gantt),
  geofence: wrap(Geofence),
  grid: wrap(Grid),
  groupedList: wrap(GroupedList),
  gps: wrap(Gps),
  heatmap: wrap(Heatmap),
  highlightBox: wrap(HighlightBox),
  html: wrap(Html),
  image: wrap(Image),
  inlineEdit: wrap(InlineEdit),
  input: wrap(Input),
  invoiceTemplate: wrap(InvoiceTemplate),
  jsonEditor: wrap(JsonEditor),
  jsonViewer: wrap(JsonViewer),
  labelValue: wrap(LabelValue),
  lineChart: wrap(LineChart),
  liveChart: wrap(LiveChart),
  liveGauge: wrap(LiveGauge),
  loadingBar: wrap(LoadingBar),
  machineStatus: wrap(MachineStatus),
  map: wrap(Map),
  mapView: wrap(MapView),
  markdown: wrap(Markdown),
  masterDetail: wrap(MasterDetail),
  message: wrap(Message),
  modelSelector: wrap(ModelSelector),
  modal: wrap(Modal),
  notificationCenter: wrap(NotificationCenter),
  numberInput: wrap(NumberInput),
  nfcBadge: wrap(NfcBadge),
  orgChart: wrap(OrgChart),
  pagination: wrap(Pagination),
  panel: wrap(Panel),
  pageLayout: wrap(PageLayout),
  pdfViewer: wrap(PdfViewer),
  pivotTable: wrap(PivotTable),
  plcConnector: wrap(PLCConnector),
  plotlyChart: wrap(PlotlyChart),
  popover: wrap(Popover),
  predictiveChart: wrap(PredictiveChart),
  printLayout: wrap(PrintLayout),
  progress: wrap(Progress),
  progressRing: wrap(ProgressRing),
  promptInput: wrap(PromptInput),
  qrCode: wrap(QRCode),
  radarChart: wrap(RadarChart),
  radioGroup: wrap(RadioGroup),
  rating: wrap(Rating),
  relationGraph: wrap(RelationGraph),
  reportPage: wrap(ReportPage),
  richTextEditor: wrap(RichTextEditor),
  routePlanner: wrap(RoutePlanner),
  scatterChart: wrap(ScatterChart),
  scrollContainer: wrap(ScrollContainer),
  scheduler: wrap(Scheduler),
  selectbox: wrap(Selectbox),
  sensorGrid: wrap(SensorGrid),
  signaturePad: wrap(SignaturePad),
  skeleton: wrap(Skeleton),
  slider: wrap(Slider),
  sparkline: wrap(Sparkline),
  splitView: wrap(SplitView),
  spinner: (arg?: SpinnerProps) => React.createElement(Spinner, arg ?? {}),
  spinnerDot: wrap(SpinnerDot),
  stateMachine: wrap(StateMachine),
  statusBox: wrap(StatusBox),
  statusTracker: wrap(StatusTracker),
  stepper: wrap(Stepper),
  streamingText: wrap(StreamingText),
  suggestionCard: wrap(SuggestionCard),
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
  tour: wrap(Tour),
  treeview: wrap(Treeview),
  treemap: wrap(Treemap),
  video: wrap(Video),
  waterfall: wrap(Waterfall),
  wizardForm: wrap(WizardForm),
  titleBpm: wrap(TitleBpm),
};
