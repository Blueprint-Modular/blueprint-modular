"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Title, Table, Badge, Button } from "@/components/bpm";
import type { LineWithMetrics } from "@/lib/demo-production-data";
import type { DemoPeriod } from "@/lib/demo-production-data";
import { exportLinesCSV } from "../demo-export";

function statusVariant(status: string): "success" | "warning" | "error" {
  if (status === "active") return "success";
  if (status === "maintenance") return "warning";
  return "error";
}

export function DemoLinesClient({
  lines,
  period,
}: {
  lines: LineWithMetrics[];
  period: DemoPeriod;
}) {
  const handleExportCSV = useCallback(() => {
    exportLinesCSV(lines, period);
  }, [lines, period]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const tableData = lines.map((l) => ({
    name: l.name,
    code: l.code,
    status: l.status,
    todayTRS: l.todayTRS,
    todayAvailability: l.todayAvailability,
    todayPerformance: l.todayPerformance,
    todayQuality: l.todayQuality,
    activeSessions: l.activeSessions,
    codeForLink: l.code,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
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
            { key: "name", label: "Ligne" },
            { key: "code", label: "Code" },
            {
              key: "status",
              label: "Statut",
              render: (_, row) => (
                <Badge variant={statusVariant(String(row.status))}>
                  {String(row.status)}
                </Badge>
              ),
            },
            {
              key: "todayTRS",
              label: "TRS %",
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <span>{Number(row.todayTRS).toFixed(1)} %</span>
                  <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: "var(--bpm-bg-secondary)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Number(row.todayTRS))}%`,
                        background: Number(row.todayTRS) >= 80 ? "var(--bpm-accent-mint)" : Number(row.todayTRS) >= 70 ? "orange" : "#dc2626",
                      }}
                    />
                  </div>
                </div>
              ),
            },
            { key: "todayAvailability", label: "Disponibilité %", decimals: 1 },
            { key: "todayPerformance", label: "Performance %", decimals: 1 },
            { key: "todayQuality", label: "Qualité %", decimals: 1 },
            { key: "activeSessions", label: "Sessions" },
            {
              key: "action",
              label: "Action",
              render: (_, row) => (
                <Link
                  href={`/demo/production/lines/${row.codeForLink}?period=${period}`}
                  className="text-sm underline"
                  style={{ color: "var(--bpm-accent-cyan)" }}
                >
                  Détail →
                </Link>
              ),
            },
          ]}
          data={tableData}
          defaultSortColumn="todayTRS"
          defaultSortDirection="desc"
          minWidth={800}
        />
      </div>
    </div>
  );
}
