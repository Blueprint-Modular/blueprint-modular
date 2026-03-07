import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Redirection racine et /settings vers /dashboard (avant tout rendu React, évite erreurs client)
  if (pathname === "/" || pathname === "/settings") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  // Plus de redirection vers /login : l'app est accessible sans authentification.
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/settings", "/dashboard/:path*", "/docs/:path*", "/modules/:path*"],
};
