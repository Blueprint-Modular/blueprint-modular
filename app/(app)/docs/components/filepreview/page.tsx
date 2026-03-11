"use client";

import { useState } from "react";
import Link from "next/link";
import { FilePreview, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocFilePreviewPage() {
  const [url, setUrl] = useState("https://via.placeholder.com/300x200");
  const [filename, setFilename] = useState("image.png");
  const [height, setHeight] = useState<string | number>(400);
  const [showDownload, setShowDownload] = useState(true);

  const pyHeight = height !== 400 ? (typeof height === "number" ? `, height=${height}` : `, height="${height}"`) : "";
  const pyShowDownload = !showDownload ? ", showDownload=False" : "";
  const pythonCode = `bpm.filePreview(url="${url.replace(/"/g, '\\"')}", filename="${filename.replace(/"/g, '\\"')}"${pyHeight}${pyShowDownload})`;
  const { prev, next } = getPrevNext("filepreview");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.filePreview</div>
        <h1>bpm.filePreview</h1>
        <p className="doc-description">Aperçu de fichier (image, PDF, texte/code).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Média</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <FilePreview
            url={url}
            filename={filename}
            height={height}
            showDownload={showDownload}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>url</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL du fichier" />
          </div>
          <div className="sandbox-control-group">
            <label>filename</label>
            <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="nom.png" />
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value === "" ? 400 : e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>showDownload</label>
            <select value={showDownload ? "true" : "false"} onChange={(e) => setShowDownload(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>url</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>URL du fichier.</td></tr>
          <tr><td><code>filename</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Nom du fichier (pour type MIME et téléchargement).</td></tr>
          <tr><td><code>mimeType</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Type MIME (inféré depuis l&apos;extension si absent).</td></tr>
          <tr><td><code>height</code></td><td><code>string | number</code></td><td>400</td><td>Non</td><td>Hauteur de l&apos;aperçu.</td></tr>
          <tr><td><code>showDownload</code></td><td><code>boolean</code></td><td>true</td><td>Non</td><td>Afficher le lien Télécharger.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.filePreview(url=file_url, filename="rapport.pdf")'} language="python" />
      <CodeBlock code={'bpm.filePreview(url=img_url, filename="photo.png", height=300)'} language="python" />
      <CodeBlock code={'bpm.filePreview(url=url, filename="data.json", showDownload=False)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
