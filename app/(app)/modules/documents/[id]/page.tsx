"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Panel, Spinner, Message, Button } from "@/components/bpm";

type Document = {
  id: string;
  filename: string;
  analysisStatus: "pending" | "processing" | "done" | "error";
  supplier: string | null;
  client: string | null;
  contractDate: string | null;
  signatureDate: string | null;
  terminationDate: string | null;
  summary: string | null;
  keyPoints: string | null;
  commitments: string | null;
  createdAt: string;
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/documents/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setDoc(d); })
      .catch(() => { if (!cancelled) setDoc(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const isProcessing = doc?.analysisStatus === "processing";
  // eslint-disable-next-line react-hooks/exhaustive-deps -- polling only when processing
  useEffect(() => {
    if (!id || !isProcessing) return;
    const interval = setInterval(() => {
      fetch(`/api/documents/${id}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then(setDoc);
    }, 3000);
    return () => clearInterval(interval);
  }, [id, isProcessing]);

  const handleDelete = async () => {
    if (!confirm("Supprimer ce document ?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) router.push("/modules/documents");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !doc) {
    return <Spinner text="Chargement..." />;
  }
  if (!doc) {
    return (
      <Panel variant="error" title="Document introuvable">
        <Link href="/modules/documents" style={{ color: "var(--bpm-accent-cyan)" }}>Retour à la liste</Link>
      </Panel>
    );
  }

  const keyPointsArr = doc.keyPoints ? (JSON.parse(doc.keyPoints) as string[]) : [];
  const commitmentsArr = doc.commitments ? (JSON.parse(doc.commitments) as string[]) : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {doc.filename}
        </h1>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Envoyé le {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
          <span>
            {doc.analysisStatus === "done" && "✓"}
            {doc.analysisStatus === "error" && "✗ Erreur"}
            {doc.analysisStatus === "processing" && "⏳ Analyse en cours"}
            {doc.analysisStatus === "pending" && "⏳ En attente"}
          </span>
          <Button variant="outline" size="small" onClick={handleDelete} disabled={deleting}>
            Supprimer
          </Button>
        </div>
      </div>

      {doc.analysisStatus === "processing" && (
        <Spinner text="Analyse IA en cours..." size="large" />
      )}

      {doc.analysisStatus === "error" && (
        <Message type="error">
          L&apos;analyse a échoué. Vous pouvez supprimer le document ou réessayer plus tard.
        </Message>
      )}

      {doc.analysisStatus === "done" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel variant="info" title="Fournisseur">
            {doc.supplier ?? "—"}
          </Panel>
          <Panel variant="info" title="Client">
            {doc.client ?? "—"}
          </Panel>
          <Panel variant="info" title="Date de contrat">
            {doc.contractDate ? new Date(doc.contractDate).toLocaleDateString("fr-FR") : "—"}
          </Panel>
          <Panel variant="info" title="Date de signature">
            {doc.signatureDate ? new Date(doc.signatureDate).toLocaleDateString("fr-FR") : "—"}
          </Panel>
          <Panel variant="info" title="Date de dénonciation">
            {doc.terminationDate ? new Date(doc.terminationDate).toLocaleDateString("fr-FR") : "—"}
          </Panel>
          {doc.summary && (
            <Panel variant="info" title="Synthèse" className="md:col-span-2">
              {doc.summary}
            </Panel>
          )}
          {keyPointsArr.length > 0 && (
            <Panel variant="info" title="Points clés" className="md:col-span-2">
              <ul className="list-disc pl-4 space-y-1">
                {keyPointsArr.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Panel>
          )}
          {commitmentsArr.length > 0 && (
            <Panel variant="info" title="Engagements" className="md:col-span-2">
              <ul className="list-disc pl-4 space-y-1">
                {commitmentsArr.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/documents" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour à l&apos;Analyse de documents</Link>
        <Link href="/modules/documents#documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Analyser un document</Link>
        <Link href="/modules/documents/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
