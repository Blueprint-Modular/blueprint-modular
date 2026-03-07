import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Plus de redirection vers /login : l'app est accessible sans authentification.
  // La page /login reste disponible pour une connexion optionnelle (Google).
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/docs/:path*", "/modules/:path*"],
};
