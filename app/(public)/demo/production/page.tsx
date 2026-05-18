// @ts-nocheck
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

function DemoUnavailableFallback() {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center px-4"
      style={{ background: "var(--bpm-bg-primary, #ffffff)" }}
    >
      <div
        className="rounded-lg border p-6 max-w-md w-full text-center"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <h2 className="text-lg font-semibold mb-2">Démo indisponible</h2>
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          Le serveur n&apos;a pas pu charger les données. Vérifiez la base de données ou réessayez plus tard.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/demo/production"
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Réessayer
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function DemoProductionPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }> | { period?: string };
}) {
  let period: DemoPeriod = "30d";
  let data: Awaited<ReturnType<typeof getCachedDemoProductionData>>;

  try {
    const raw = searchParams != null
      ? typeof (searchParams as Promise<unknown>).then === "function"
        ? await (searchParams as Promise<{ period?: string }>)
        : (searchParams as { period?: string })
      : {};
    period = parsePeriod(raw?.period ?? null);
    data = await getCachedDemoProductionData(period);
  } catch {
    return <DemoUnavailableFallback />;
  }

  const metrics = data.metrics;
  const lines = data.lines ?? [];
  const alerts = data.alerts ?? [];
  const criticalAlerts = alerts.filter((a: any) => a.severity === "critical").slice(0, 3);

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
