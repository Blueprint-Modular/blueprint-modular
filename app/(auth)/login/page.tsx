import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null;

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center" style={{ color: "var(--bpm-accent)" }}>
          Connexion
        </h1>
        {callbackUrl && (
          <p className="text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Connexion optionnelle. Après connexion vous serez redirigé vers <strong>{callbackUrl}</strong>. Vous pouvez aussi accéder à l&apos;app sans vous connecter.
          </p>
        )}
        <div className="flex flex-col gap-3">
          <a
            href={callbackUrl ? `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/api/auth/signin/google"}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition opacity-90 hover:opacity-100"
            style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}
          >
            Continuer avec Google
          </a>
        </div>
        <p className="text-center text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href={callbackUrl || "/"} className="underline">
            {callbackUrl ? "Accéder sans se connecter" : "Retour à l&apos;accueil"}
          </Link>
        </p>
      </div>
    </main>
  );
}
