import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { getDomainIds } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const ids = getDomainIds();
  return NextResponse.json({ domainIds: ids });
}
