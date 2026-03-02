import Link from "next/link";
import { getCachedDemoLineDetail } from "@/lib/demo-production-data";
import type { DemoPeriod } from "@/lib/demo-production-data";
import {
  Title,
  Metric,
  LineChart,
  BarChart,
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

export default async function DemoLineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { id: lineCode } = await params;
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam ?? null);
  let detail;
  try {
    detail = await getCachedDemoLineDetail(lineCode, period);
  } catch {
    detail = null;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <p style={{ color: "var(--bpm-text-secondary)" }}>
          Ligne &quot;{lineCode}&quot; introuvable.
        </p>
        <Link href={`/demo/production/lines?period=${period}`}>
          <Button variant="secondary">← Retour aux lignes</Button>
        </Link>
      </div>
    );
  }

  const { line, trsHistory, lossHistory, sessions, alerts } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={1}>{line.name}</Title>
          <p className="text-sm mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Code : {line.code} — Statut : {line.status} — Cadence théorique :{" "}
            {line.theoreticalRate} u/h
          </p>
        </div>
        <Link href={`/demo/production/lines?period=${period}`}>
          <Button variant="secondary">← Retour aux lignes</Button>
        </Link>
      </div>

      <Grid cols={4}>
        <Column>
          <Metric
            label="TRS"
            value={
              trsHistory.length
                ? `${(trsHistory.reduce((a, x) => a + x.trs, 0) / trsHistory.length).toFixed(1)} %`
                : "—"
            }
            border
          />
        </Column>
        <Column>
          <Metric
            label="Disponibilité"
            value="—"
            border
          />
        </Column>
        <Column>
          <Metric label="Performance" value="—" border />
        </Column>
        <Column>
          <Metric label="Qualité" value="—" border />
        </Column>
      </Grid>

      {trsHistory.length > 0 && (
        <div style={{ minHeight: 220 }}>
          <Title level={2}>Évolution TRS (période)</Title>
          <div style={{ width: "100%", maxWidth: 600, height: 200 }}>
            <LineChart
              data={trsHistory.map((d) => ({
                x: typeof d.date === "string" ? d.date.slice(5) : String(d.date),
                y: d.trs,
              }))}
              width={600}
              height={200}
            />
          </div>
        </div>
      )}

      {lossHistory.length > 0 && (
        <div style={{ minHeight: 220 }}>
          <Title level={2}>Pertes matière (période)</Title>
          <div style={{ width: "100%", maxWidth: 600, height: 200 }}>
            <BarChart
              data={lossHistory.map((d) => ({
                x: typeof d.date === "string" ? d.date.slice(5) : String(d.date),
                y: d.loss,
              }))}
              width={600}
              height={200}
            />
          </div>
        </div>
      )}

      <Title level={2}>Dernières sessions</Title>
      <Table
        columns={[
          { key: "startedAt", label: "Date" },
          { key: "shift", label: "Shift" },
          { key: "operatorName", label: "Opérateur" },
          { key: "trs", label: "TRS %" },
          { key: "parts", label: "Bonnes / Total" },
          { key: "rawMaterialLost", label: "Pertes (kg)" },
          { key: "notes", label: "Notes" },
        ]}
        data={sessions.map((s) => ({
          startedAt: new Date(s.startedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
          shift: s.shift ?? "—",
          operatorName: s.operatorName ?? "—",
          trs: `${s.trs} %`,
          parts: `${s.goodParts} / ${s.totalParts}`,
          rawMaterialLost: s.rawMaterialLost,
          notes: (s.notes ?? "").slice(0, 30),
        }))}
        minWidth={700}
      />

      {alerts.length > 0 && (
        <>
          <Title level={2}>Alertes de cette ligne</Title>
          <div className="space-y-2">
            {alerts.map((a) => (
              <Panel key={a.id} title={a.type} variant="warning">
                {a.message}
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
