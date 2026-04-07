"use client";

import React from "react";

export interface InvoiceLine {
  label: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceTemplateProps {
  title?: string;
  issuer: string;
  client: string;
  lines: InvoiceLine[];
  taxRate?: number;
  invoiceNo?: string;
  date?: string;
  className?: string;
}

export function InvoiceTemplate({
  title = "Facture",
  issuer,
  client,
  lines,
  taxRate = 0.2,
  invoiceNo = "—",
  date = new Date().toISOString().slice(0, 10),
  className = "",
}: InvoiceTemplateProps) {
  const sub = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const tax = sub * taxRate;
  const total = sub + tax;

  return (
    <>
      <style>{`
        @media print {
          .bpm-invoice-root {
            box-shadow: none !important;
            margin: 0 !important;
          }
          .bpm-invoice-no-print {
            display: none !important;
          }
        }
        .bpm-invoice-root {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 18mm 16mm;
          box-sizing: border-box;
          background: var(--bpm-surface);
          color: var(--bpm-text-primary);
          font-size: 11pt;
        }
      `}</style>
      <div className={"bpm-invoice-root " + className}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid var(--bpm-accent)",
            paddingBottom: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: "var(--bpm-text-primary)" }}>{title}</h1>
            <div style={{ color: "var(--bpm-text-secondary)", marginTop: 6 }}>N° {invoiceNo}</div>
            <div style={{ color: "var(--bpm-text-secondary)" }}>Date : {date}</div>
          </div>
          <div style={{ textAlign: "right", color: "var(--bpm-text-secondary)" }}>
            <strong style={{ color: "var(--bpm-text-primary)" }}>Émetteur</strong>
            <div style={{ whiteSpace: "pre-line", marginTop: 6 }}>{issuer}</div>
          </div>
        </header>
        <section style={{ marginBottom: 24 }}>
          <strong style={{ color: "var(--bpm-text-primary)" }}>Client</strong>
          <div style={{ marginTop: 8, whiteSpace: "pre-line", color: "var(--bpm-text-secondary)" }}>
            {client}
          </div>
        </section>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 16,
          }}
        >
          <thead>
            <tr>
              {["Désignation", "Qté", "P.U.", "Montant"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: h === "Désignation" ? "left" : "right",
                    padding: "8px 6px",
                    borderBottom: "1px solid var(--bpm-border-strong)",
                    color: "var(--bpm-text-secondary)",
                    fontSize: 10,
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid var(--bpm-border)" }}>{l.label}</td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid var(--bpm-border)", textAlign: "right" }}>
                  {l.qty}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid var(--bpm-border)", textAlign: "right" }}>
                  {l.unitPrice.toFixed(2)}
                </td>
                <td style={{ padding: "8px 6px", borderBottom: "1px solid var(--bpm-border)", textAlign: "right" }}>
                  {(l.qty * l.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginLeft: "auto", width: 220, fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "var(--bpm-text-secondary)" }}>Sous-total</span>
            <span>{sub.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "var(--bpm-text-secondary)" }}>TVA ({Math.round(taxRate * 100)}%)</span>
            <span>{tax.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 8,
              borderTop: "2px solid var(--bpm-accent)",
              fontWeight: 700,
            }}
          >
            <span>Total TTC</span>
            <span>{total.toFixed(2)}</span>
          </div>
        </div>
        <p
          className="bpm-invoice-no-print"
          style={{ marginTop: 32, fontSize: 10, color: "var(--bpm-text-muted)" }}
        >
          Aperçu A4 — utiliser l’impression du navigateur pour PDF / papier.
        </p>
      </div>
    </>
  );
}
