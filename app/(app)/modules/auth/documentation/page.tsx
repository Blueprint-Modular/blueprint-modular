"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function AuthDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/auth">Auth</Link>
          {" → "}
          Documentation
        </nav>
        <h1>Documentation – Auth</h1>
        <p className="doc-description">
          Implémentation, choix du modèle de page de connexion, et utilisation du module Auth (NextAuth, Google, e-mail, whitelist).
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-auth</code> ni <code>npm install blueprint-modular-auth</code>) : on installe l&apos;application une fois, puis on configure les variables d&apos;environnement (NextAuth, Google, whitelist). Cette documentation décrit comment implémenter Auth, comment choisir le modèle de page (carte centrée, split, Google seul), les lignes de code pour charger et utiliser le module, et le paramétrage (variables d&apos;environnement).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Implémentation
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Auth repose sur <strong>NextAuth</strong> (providers Google et credentials). La session est stockée en JWT et disponible côté serveur (<code>getServerSession</code>) et côté client (<code>useSession</code>). Les pages protégées redirigent vers <code>/login</code> si l&apos;utilisateur n&apos;est pas connecté.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Charger le module (côté app)
      </h3>
      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>Route API NextAuth : <code>app/api/auth/[...nextauth]/route.ts</code> qui exporte le handler avec <code>authOptions</code>.</li>
        <li>Provider de session : envelopper l&apos;app avec <code>SessionProvider</code> (via <code>AuthProvider</code>) dans le layout racine.</li>
        <li>Configuration : <code>lib/auth.ts</code> (authOptions, whitelist, callbacks).</li>
      </ul>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Exemple — route API NextAuth :</p>
      <CodeBlock
        code={`import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`}
        language="typescript"
      />

      <p className="mb-2 mt-4 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Exemple — layout racine (charger la session côté client) :</p>
      <CodeBlock
        code={`import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// Dans app/layout.tsx :
<AuthProvider>
  {children}
</AuthProvider>`}
        language="typescript"
      />

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Base de données
      </h3>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Auth s&apos;appuie sur les tables <code>User</code> et <code>ApiKey</code> (schéma Prisma). En production, <code>DATABASE_URL</code> doit être défini. Pour la liste des structures BDD et prérequis par module, voir <code>docs/DATABASE.md</code> dans le dépôt.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Variables d&apos;environnement
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        À définir dans <code>.env</code> ou votre hébergeur :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>DATABASE_URL</code> — Connexion PostgreSQL (obligatoire pour la persistance des utilisateurs).</li>
        <li><code>GOOGLE_CLIENT_ID</code> et <code>GOOGLE_CLIENT_SECRET</code> — pour la connexion Google.</li>
        <li><code>NEXTAUTH_SECRET</code> — secret pour signer les JWT (obligatoire en production).</li>
        <li><code>NEXTAUTH_URL</code> — URL de l&apos;app (ex. <code>https://app.blueprint-modular.com</code>).</li>
        <li><code>AUTHORIZED_EMAILS</code> (optionnel) — liste d&apos;emails autorisés, séparés par des virgules (whitelist). Si défini, seuls ces emails peuvent se connecter (Google ou e-mail).</li>
        <li><code>CREDENTIALS_DEMO_PASSWORD</code> (optionnel) — mot de passe unique pour le provider credentials (connexion e-mail de démo).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Choix du modèle de page de connexion
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Trois variantes sont disponibles. Par défaut, les routes <code>/login</code> et <code>/register</code> utilisent le <strong>modèle carte centrée</strong>. Vous pouvez activer le layout split ou le mode Google seul via les paramètres d&apos;URL ou les props des composants.
      </p>

      <table className="w-full border-collapse text-sm mb-6" style={{ borderColor: "var(--bpm-border)" }}>
        <thead>
          <tr>
            <th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Modèle</th>
            <th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>URL / paramètres</th>
            <th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><strong>Carte centrée</strong></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>/login</code>, <code>/register</code> (défaut)</td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Formulaire dans une carte centrée, option Google + e-mail.</td>
          </tr>
          <tr>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><strong>Split</strong></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>?layout=split</code></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Formulaire à gauche, image à droite (ex. <Link href="/login?layout=split" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>/login?layout=split</Link>).</td>
          </tr>
          <tr>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><strong>Google seul</strong></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>?showEmailOption=false</code></td>
            <td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Un seul bouton « Google », pas de formulaire e-mail (ex. <Link href="/login?showEmailOption=false" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>/login?showEmailOption=false</Link>).</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Lignes de code pour utiliser Auth
      </h2>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Pages de connexion et d&apos;inscription (routes) :</p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Créez <code>app/(auth)/login/page.tsx</code> et <code>app/(auth)/register/page.tsx</code> qui rendent les composants <code>LoginPage</code> et <code>RegisterPage</code> avec les props souhaitées (titre, sous-titre, layout, option e-mail).
      </p>
      <CodeBlock
        code={`// app/(auth)/login/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginPage } from "@/components/auth";

export default async function LoginPageRoute({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const useSplitLayout = params?.layout === "split";
  const showEmailOption = params?.showEmailOption !== "false";

  return (
    <LoginPage
      title="Blueprint Modular"
      subtitle={showEmailOption ? "Connexion sécurisée (Google ou e-mail)" : "Connexion avec Google"}
      logoSrc="/img/logo-bpm-nom.jpg"
      callbackUrl={params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null}
      showEmailOption={showEmailOption}
      useSplitLayout={useSplitLayout}
    />
  );
}`}
        language="typescript"
      />

      <p className="mb-2 mt-6 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Session côté serveur (pages, API) :</p>
      <CodeBlock
        code={`import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <div>Bonjour, {session.user?.name}</div>;
}`}
        language="typescript"
      />

      <p className="mb-2 mt-6 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Session côté client (composants) :</p>
      <CodeBlock
        code={`"use client";
import { useSession, signOut } from "next-auth/react";

export function MonComposant() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Chargement…</p>;
  if (!session) return <p>Non connecté</p>;
  return (
    <div>
      <p>Connecté : {session.user?.email}</p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Se déconnecter</button>
    </div>
  );
}`}
        language="typescript"
      />

      <p className="mb-2 mt-6 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Redirection après connexion :</p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        NextAuth utilise <code>pages.signIn: &quot;/login&quot;</code> dans <code>authOptions</code>. Pour rediriger vers une URL après login, passez <code>callbackUrl</code> en query (ex. <code>/login?callbackUrl=/dashboard</code>) ou utilisez <code>signIn(..., &#123; callbackUrl: &quot;/dashboard&quot; &#125;)</code>.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Whitelist (AUTHORIZED_EMAILS)
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Si la variable <code>AUTHORIZED_EMAILS</code> est définie (liste d&apos;emails séparés par des virgules), seuls ces utilisateurs peuvent se connecter, que ce soit via Google ou le provider credentials. Utile pour restreindre l&apos;accès à une équipe ou un environnement de démo.
      </p>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/auth" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module Auth
        </Link>
      </nav>
    </div>
  );
}
