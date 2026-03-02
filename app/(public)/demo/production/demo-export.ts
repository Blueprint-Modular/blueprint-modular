import type { LineWithMetrics } from "@/lib/demo-production-data";
import type { DemoPeriod } from "@/lib/demo-production-data";
import type { DemoAlert } from "@/lib/demo-production-data";

function escapeCSV(val: unknown): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportLinesCSV(lines: LineWithMetrics[], period: DemoPeriod) {
  const headers = [
    "Ligne",
    "Code",
    "Statut",
    "TRS %",
    "Disponibilité %",
    "Performance %",
    "Qualité %",
    "Sessions",
  ];
  const rows = lines.map((l) => [
    l.name,
    l.code,
    l.status,
    l.todayTRS.toFixed(2),
    l.todayAvailability.toFixed(2),
    l.todayPerformance.toFixed(2),
    l.todayQuality.toFixed(2),
    l.activeSessions,
  ]);
  const csv = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bpm-production-lignes-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAlertsCSV(alerts: DemoAlert[], period: DemoPeriod) {
  const headers = ["Date", "Ligne", "Type", "Sévérité", "Message", "Valeur", "Seuil"];
  const rows = alerts.map((a) => [
    a.createdAt ?? "",
    a.line?.name ?? "",
    a.type,
    a.severity,
    (a.message ?? "").replace(/\n/g, " "),
    a.value ?? "",
    a.threshold ?? "",
  ]);
  const csv = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bpm-production-alertes-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
