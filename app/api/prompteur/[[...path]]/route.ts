/**
 * Proxy vers le backend Prompteur (FastAPI, port 8001).
 * En prod, Nginx peut router /api/prompteur directement ; ce proxy sert en dev local.
 * PROMPTEUR_API_URL = http://localhost:8001 (ou URL du service)
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PROMPTEUR_BASE = process.env.PROMPTEUR_API_URL ?? "http://localhost:8001";
const BASE_PATH = "/api/prompteur";

function buildUrl(path: string[]): string {
  const segment = path.length ? path.join("/") : "";
  return `${PROMPTEUR_BASE}${BASE_PATH}${segment ? `/${segment}` : ""}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const url = buildUrl(path);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Proxy error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const url = buildUrl(path);
  const contentType = req.headers.get("content-type") ?? "";

  try {
    let body: RequestInit["body"];
    const headers: Record<string, string> = {};
    if (contentType.includes("multipart/form-data")) {
      body = await req.formData();
      // Ne pas envoyer Content-Type pour FormData (fetch ajoute le boundary)
    } else if (contentType.includes("application/json")) {
      body = await req.text();
      headers["Content-Type"] = "application/json";
    } else {
      body = req.body;
      if (contentType) headers["Content-Type"] = contentType;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: Object.keys(headers).length ? headers : undefined,
      body,
      cache: "no-store",
      duplex: "half",
    } as RequestInit);

    if (res.headers.get("content-type")?.includes("text/event-stream")) {
      return new Response(res.body, {
        status: res.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Proxy error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
