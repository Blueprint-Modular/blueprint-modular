import { getCachedDemoLines } from "@/lib/demo-production-data";
import type { DemoPeriod, LineWithMetrics } from "@/lib/demo-production-data";
import { DemoLinesClient } from "./DemoLinesClient";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function parsePeriod(s: string | null): DemoPeriod {
  if (s === "7d" || s === "30d" || s === "90d") return s;
  return "30d";
}

export default async function DemoLinesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period ?? null);
  let lines: LineWithMetrics[] = [];
  try {
    lines = await getCachedDemoLines(period);
  } catch {
    // keep []
  }
  return <DemoLinesClient lines={lines} period={period} />;
}
