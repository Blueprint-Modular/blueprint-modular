/**
 * GET /api/blueprint/info — métadonnées de l'instance (public, sans auth).
 * Permet à Master / outils de découvrir l'instance Blueprint Modular.
 */

import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptime =
    typeof process !== "undefined" && typeof process.uptime === "function"
      ? process.uptime()
      : 0;
  const body = {
    blueprint: "modular",
    version: APP_VERSION,
    status: "online",
    uptime: Math.round(uptime),
    modules_active: [
      "auth",
      "wiki",
      "documents",
      "contracts",
      "ia",
      "production",
      "sandbox",
    ],
    provider: process.env.AI_PROVIDER ?? null,
    timestamp: new Date().toISOString(),
  };
  return Response.json(body);
}
