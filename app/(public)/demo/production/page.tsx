import Link from "next/link";
import { getCachedDemoProductionData } from "@/lib/demo-production-data";
import type { DemoPeriod } from "@/lib/demo-production-data";
import { DemoErrorBoundary } from "./DemoErrorBoundary";
import {
  Title,
  Metric,
  LineChart,
  Progress,
  Table,
  Panel,
  Grid,
  Column,
  Button,
} from "@/components/bpm";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function parsePeriod(s: string | null): DemoPeriod {
  if (s === "7d" || s === "30d" || s === "90d") return s;
  return "30d";
}

export default async function DemoProductionPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }> | { period?: string };
}) {
  const raw = searchParams != null
    ? typeof (searchParams as Promise<unknown>).then === "function"
      ? await (searchParams as Promise<{ period?: string }>)
      : (searchParams as { period?: string })
    : {};
  const period = parsePeriod(raw?.period ?? null);
  let data: Awaited<ReturnType<typeof getCachedDemoProductionData>>;
  try {
    data = await getCachedDemoProductionData(period);
  } catch {
    data = { metrics: null, lines: [], alerts: [] };
  }

  const metrics = data.metrics;
  const lines = data.lines ?? [];
  const alerts = data.alerts ?? [];
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").slice(0, 3);

  return (
    <DemoErrorBoundary>
      <div className="space-y-6">
        <Title level={1}>Vue globale</Title>

        {metrics ? (
          <>
            <Grid cols={4}>
              <Column>
                <Metric
                  label="TRS global"
                  value={`${Number(metrics.globalTRS) ?? 0} %`}
                  border
                />
              </Column>
              <Column>
                <Metric
                  label="Taux de rejet"
                  value={
                    metrics.totalProduction > 0
                      ? `${((Number(metrics.totalRejects) / metrics.totalProduction) * 100).toFixed(2)} %`
                      : "0 %"
                  }
                  border
                />
              </Column>
              <Column>
                <Metric
                  label="Pertes matière (%)"
                  value={`${Number(metrics.globalLossRate) ?? 0} %`}
                  border
                />
              </Column>
              <Column>
                <Metric
                  label="Pièces produites"
                  value={Number(metrics.totalProduction).toLocaleString("fr-FR")}
                  border
                />
              </Column>
            </Grid>

            <Progress
              value={Number(metrics.globalTRS) || 0}
              max={Number(metrics.trsTarget) || 80}
              label={`${Number(metrics.globalTRS).toFixed(2)}% / objectif ${metrics.trsTarget ?? 80}%`}
              showValue
            />
            {Number(metrics.globalTRS) < 80 && (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                TRS sous l&apos;objectif — couleur d&apos;alerte appliquée au besoin.
              </p>
            )}

            {Array.isArray(metrics.trsEvolution) && metrics.trsEvolution.length > 0 && (
              <div style={{ minHeight: 240 }}>
                <Title level={2}>Évolution TRS (période)</Title>
                <div style={{ width: "100%", maxWidth: 700, height: 220 }}>
                  <LineChart
                    data={metrics.trsEvolution.map((d) => ({
                      x: typeof d.date === "string" ? d.date.slice(5) : String(d.date),
                      y: Number(d.trs) || 0,
                    }))}
                    width={700}
                    height={220}
                  />
                </div>
              </div>
            )}

            <Title level={2}>Résumé des lignes</Title>
            <Table
              columns={[
                { key: "name", label: "Ligne" },
                { key: "code", label: "Code" },
                { key: "todayTRS", label: "TRS %" },
                { key: "status", label: "Statut" },
                {
                  key: "action",
                  label: "Action",
                  render: (_, row) => (
                    <Link
                      href={`/demo/production/lines/${row.code}?period=${period}`}
                      className="text-sm underline"
                      style={{ color: "var(--bpm-accent-cyan)" }}
                    >
                      Voir le détail →
                    </Link>
                  ),
                },
              ]}
              data={lines.map((l) => ({
                name: l.name,
                code: l.code,
                todayTRS: `${l.todayTRS} %`,
                status: l.status,
                action: null,
              }))}
              minWidth={500}
            />

            {criticalAlerts.length > 0 && (
              <>
                <Title level={2}>Alertes critiques actives</Title>
                <div className="space-y-3">
                  {criticalAlerts.map((a) => (
                    <Panel key={a.id} title={`${a.type} — ${a.line?.name ?? "—"}`} variant="warning">
                      {a.message}
                    </Panel>
                  ))}
                </div>
                <Link href={`/demo/production/alerts?period=${period}`}>
                  <Button variant="secondary" size="small">
                    Voir toutes les alertes →
                  </Button>
                </Link>
              </>
            )}
          </>
        ) : (
          <p style={{ color: "var(--bpm-text-secondary)" }}>
            Aucune donnée production. Lancez le seed :{" "}
            <code>npm run seed:production</code>
          </p>
        )}
      </div>
    </DemoErrorBoundary>
  );
}
