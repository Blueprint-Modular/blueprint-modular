import { AIChat } from "@/components/AIChat/AIChat";

export default function IAPage() {
  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div className="page-header mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-accent)" }}>
          🤖 Assistant IA
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Discutez avec Claude, GPT, Gemini ou Grok. Utilisez @claude, @gpt pour choisir le modèle.
        </p>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <AIChat />
      </div>
    </div>
  );
}
