import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginPage } from "@/components/auth";

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function LoginPageRoute({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null;

  return (
    <LoginPage
      title="Blueprint Modular"
      subtitle="Connexion sécurisée (Google ou e-mail)"
      logoSrc="/img/logo-bpm-nom.jpg"
      callbackUrl={callbackUrl}
      showEmailOption={true}
    />
  );
}
