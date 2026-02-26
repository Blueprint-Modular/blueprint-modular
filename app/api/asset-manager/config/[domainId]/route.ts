import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

type Params = Promise<{ domainId: string }> | { domainId: string };

async function resolveParams(params: Params): Promise<{ domainId: string }> {
  return typeof (params as Promise<{ domainId: string }>)?.then === "function"
    ? await (params as Promise<{ domainId: string }>)
    : (params as { domainId: string });
}

export async function GET(_request: Request, context: { params: Params }) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { domainId } = await resolveParams(context.params);
  const config = getDomainConfig(domainId);
  if (!config) return NextResponse.json({ error: "Domaine introuvable" }, { status: 404 });
  return NextResponse.json(config);
}
