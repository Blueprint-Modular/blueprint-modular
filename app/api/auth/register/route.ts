import { NextResponse } from "next/server";

/**
 * Inscription par e-mail (stub).
 * Pour l’instant l’app utilise Google OAuth ; cette route retourne 501.
 * Quand un flux email/password sera implémenté (hash mot de passe, création User, etc.),
 * remplacer par la logique réelle et rediriger vers /login après création.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, name } = body as { email?: string; password?: string; name?: string };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email et mot de passe requis." },
      { status: 400 }
    );
  }

  // Stub : inscription par e-mail non implémentée
  return NextResponse.json(
    {
      error:
        "Inscription par e-mail non disponible. Utilisez Google pour créer un compte.",
    },
    { status: 501 }
  );
}
