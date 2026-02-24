import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const WHISPER_URL = process.env.WHISPER_SERVICE_URL ?? "http://localhost:9000";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    if (!audioFile) {
      return new Response(JSON.stringify({ error: "Fichier audio manquant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const proxyFormData = new FormData();
    proxyFormData.append("audio", audioFile, audioFile.name || "recording.webm");

    const whisperRes = await fetch(`${WHISPER_URL}/transcribe`, {
      method: "POST",
      body: proxyFormData,
      signal: AbortSignal.timeout(180000),
    });

    if (!whisperRes.ok) {
      const text = await whisperRes.text();
      throw new Error(`Whisper service error ${whisperRes.status}: ${text.slice(0, 200)}`);
    }

    const data = (await whisperRes.json()) as {
      transcription?: string;
      language?: string;
      error?: string;
    };

    if (data.error) throw new Error(data.error);

    return new Response(
      JSON.stringify({ transcription: data.transcription ?? "" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur transcription";
    const userMessage =
      message.includes("localhost") || message.includes("9000")
        ? "Le service de transcription est temporairement indisponible."
        : message;
    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
