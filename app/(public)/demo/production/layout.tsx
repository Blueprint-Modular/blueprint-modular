import { DemoProductionLayoutClient } from "./DemoProductionLayoutClient";

export default function DemoProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoProductionLayoutClient>{children}</DemoProductionLayoutClient>;
}
