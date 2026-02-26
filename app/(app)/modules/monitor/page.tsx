"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Monitor = dynamic(() => import("@/components/Monitor/Monitor"), { ssr: false });

export default function MonitorPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div>
          <div className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → Monitor
          </div>
          <h1 style={{ margin: 0 }}>Blueprint Monitor</h1>
          <p className="doc-description" style={{ margin: "0.25rem 0 0" }}>
            Téléprompte IA pour présentations — import PPTX, suggestions Q&R, traduction et résumé de séance.
          </p>
          <div className="doc-meta" style={{ marginTop: 4 }}>
            <span className="doc-badge doc-badge-category">IA</span>
            <span className="doc-reading-time">⏱ 2 min</span>
          </div>
        </div>
      </div>
      <Monitor />
    </div>
  );
}
