import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Retourne l'utilisateur courant (pour formulaires MAD, assignation, etc.). */
export async function GET() {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.json({
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
  });
}
