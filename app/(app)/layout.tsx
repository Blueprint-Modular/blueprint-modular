import { Sidebar } from "@/components/Sidebar";
import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChunkErrorBoundary>
      <div className="min-h-screen flex" style={{ background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen pt-4 pb-20 md:pb-4 px-4">
          {children}
        </main>
      </div>
    </ChunkErrorBoundary>
  );
}
