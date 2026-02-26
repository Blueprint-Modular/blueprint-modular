import { AssetManagerDomainLayout } from "./AssetManagerDomainLayout";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domainId: string };
}) {
  const domainId = params?.domainId ?? "";
  if (!domainId) return <>{children}</>;
  return (
    <AssetManagerDomainLayout domainId={domainId}>
      {children}
    </AssetManagerDomainLayout>
  );
}
