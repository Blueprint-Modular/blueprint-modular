import { getCachedDemoAlerts } from "@/lib/demo-production-data";
import type { DemoAlert } from "@/lib/demo-production-data";
import { DemoAlertsClient } from "./DemoAlertsClient";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function DemoAlertsPage() {
  let alerts: DemoAlert[] = [];
  try {
    alerts = await getCachedDemoAlerts("all");
  } catch {
    // keep []
  }
  return <DemoAlertsClient initialAlerts={alerts} />;
}
