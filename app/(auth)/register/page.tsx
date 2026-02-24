import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RegisterPage } from "@/components/auth";

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function RegisterPageRoute({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ? decodeURIComponent(params.callbackUrl) : null;

  return (
    <RegisterPage
      title="Blueprint Modular"
      logoSrc="/img/logo-bpm-nom.jpg"
      callbackUrl={callbackUrl}
    />
  );
}
