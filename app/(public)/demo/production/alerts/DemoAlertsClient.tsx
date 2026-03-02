"use client";

import { useMemo, useState, useCallback } from "react";
import { Title, Table, Badge, Button } from "@/components/bpm";
import type { DemoAlert } from "@/lib/demo-production-data";
import { useDemoPeriod } from "../DemoPeriodContext";
import { exportAlertsCSV } from "../demo-export";

type SeverityFilter = "all" | "critical" | "warning" | "info";
type StatusFilter = "active" | "all";

function severityVariant(s: string): "success" | "warning" | "error" | "default" {
  if (s === "critical") return "error";
  if (s === "warning") return "warning";
  if (s === "info") return "default";
  return "success";
}

export function DemoAlertsClient({ initialAlerts }: { initialAlerts: DemoAlert[] }) {
  const { period } = useDemoPeriod();
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = initialAlerts;
    if (status === "active") {
      list = list.filter((a) => !a.acknowledgedAt && !acknowledged.has(a.id));
    }
    if (severity !== "all") {
      list = list.filter((a) => a.severity === severity);
    }
    return list;
  }, [initialAlerts, status, severity, acknowledged]);

  const activeCount = useMemo(
    () => initialAlerts.filter((a) => !a.acknowledgedAt && !acknowledged.has(a.id)).length,
    [initialAlerts, acknowledged]
  );
  const criticalCount = useMemo(
    () => initialAlerts.filter((a) => a.severity === "critical" && !a.acknowledgedAt && !acknowledged.has(a.id)).length,
    [initialAlerts, acknowledged]
  );

  const handleAck = useCallback((id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  }, []);

  const handleExportCSV = useCallback(() => {
    exportAlertsCSV(filtered, period);
  }, [filtered, period]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const tableData = filtered.map((a) => ({
    id: a.id,
    createdAt: a.createdAt ? new Date(a.createdAt).toLocaleString("fr-FR") : "—",
    lineName: a.line?.name ?? "—",
    type: a.type,
    severity: a.severity,
    message: a.message,
    valueVsThreshold: a.value != null && a.threshold != null ? `${a.value} / ${a.threshold}` : "—",
    acked: acknowledged.has(a.id),
  }));

  return (
    <div className="space-y-4">
      <Title level={1}>Alertes</Title>
      <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {activeCount} alerte(s) active(s) dont {criticalCount} critique(s).
      </p>
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm">Sévérité :</span>
          {(["all", "critical", "warning", "info"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className="rounded px-2 py-1 text-xs font-medium"
              style={{
                background: severity === s ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-secondary)",
                color: severity === s ? "#fff" : "var(--bpm-text-primary)",
              }}
            >
              {s === "all" ? "Toutes" : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Statut :</span>
          {(["active", "all"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className="rounded px-2 py-1 text-xs font-medium"
              style={{
                background: status === s ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-secondary)",
                color: status === s ? "#fff" : "var(--bpm-text-primary)",
              }}
            >
              {s === "active" ? "Actives" : "Toutes"}
            </button>
          ))}
        </div>
        <Button variant="outline" size="small" onClick={handleExportCSV}>
          Export CSV
        </Button>
        <Button variant="outline" size="small" onClick={handlePrint}>
          Export PDF (impression)
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={[
            { key: "createdAt", label: "Date" },
            { key: "lineName", label: "Ligne" },
            { key: "type", label: "Type" },
            {
              key: "severity",
              label: "Sévérité",
              render: (_, row) => (
                <Badge variant={severityVariant(String(row.severity))}>
                  {String(row.severity)}
                </Badge>
              ),
            },
            { key: "message", label: "Message" },
            { key: "valueVsThreshold", label: "Valeur vs Seuil" },
            {
              key: "action",
              label: "",
              render: (_, row) =>
                !row.acked ? (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleAck(String(row.id))}
                  >
                    Acquitter
                  </Button>
                ) : (
                  <Badge variant="success">Acquittée ✓</Badge>
                ),
            },
          ]}
          data={tableData}
          minWidth={750}
        />
      </div>
    </div>
  );
}
