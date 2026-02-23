import Link from "next/link";
import { notFound } from "next/navigation";
import registry from "@/lib/generated/bpm-components.json";
import { getPrevNext } from "@/lib/docPages";

type Props = { params: Promise<{ slug: string }> };

export default async function DocComponentSlugPage({ params }: Props) {
  const { slug } = await params;
  const entry = registry.components.find((c) => c.slug === slug);
  if (!entry) notFound();

  const { prev, next } = getPrevNext(slug);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → {entry.name}
        </div>
        <h1>{entry.name}</h1>
        <p className="doc-description">{entry.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{entry.category}</span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          Tester ce composant en direct dans le sandbox :
        </p>
        <Link
          href={`/sandbox?component=${slug}`}
          className="doc-cta inline-block"
        >
          Ouvrir dans le sandbox
        </Link>
      </div>

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
