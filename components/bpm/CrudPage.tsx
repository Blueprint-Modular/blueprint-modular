"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table } from "./Table";
import type { TableColumn } from "./Table";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { Selectbox } from "./Selectbox";
import { Textarea } from "./Textarea";
import { Badge } from "./Badge";
import { NumberInput } from "./NumberInput";
import { DateInput } from "./DateInput";
import { Toggle } from "./Toggle";
import { Spinner } from "./Spinner";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 20;

export interface CrudColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "badge" | "boolean";
  sortable?: boolean;
}

export interface CrudField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface CrudPageProps {
  title: string;
  endpoint: string;
  columns: CrudColumn[];
  fields: CrudField[];
  domain?: string;
  semantic?: string;
  /** Champ utilisé comme identifiant pour GET/PUT/DELETE (défaut: "id"). */
  idKey?: string;
}

function formatCellValue(value: unknown, type?: string): React.ReactNode {
  if (value == null) return "";
  if (type === "boolean") return value ? "Oui" : "Non";
  if (type === "date" && (value instanceof Date || typeof value === "string")) {
    const d = typeof value === "string" ? new Date(value) : value;
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("fr-FR");
  }
  return String(value);
}

export function CrudPage({
  title,
  endpoint,
  columns,
  fields,
  idKey = "id",
}: CrudPageProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "detail" | null>(null);
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Record<string, unknown> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { credentials: "include" });
      const raw = await res.json().catch(() => []);
      const list = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
      setData(Array.isArray(list) ? list : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const v = row[col.key];
        return String(v ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = useMemo(
    () => filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredData, currentPage]
  );

  const tableColumns: TableColumn[] = useMemo(
    () =>
      columns.map((col) => ({
        key: col.key,
        label: col.label,
        align: col.type === "number" ? "right" : "left",
        render: (value: unknown, row: Record<string, unknown>) => {
          if (col.type === "badge") {
            return <Badge variant="default">{formatCellValue(value, col.type)}</Badge>;
          }
          if (col.type === "boolean") {
            return <Badge variant={value ? "success" : "default"}>{value ? "Oui" : "Non"}</Badge>;
          }
          return formatCellValue(value, col.type);
        },
      })),
    [columns]
  );

  const openCreate = () => {
    setFormValues({});
    setSelectedRow(null);
    setModalMode("create");
  };

  const openEdit = (row: Record<string, unknown>) => {
    setSelectedRow(row);
    setFormValues({ ...row });
    setModalMode("edit");
  };

  const openDetail = (row: Record<string, unknown>) => {
    setSelectedRow(row);
    setFormValues({ ...row });
    setModalMode("detail");
  };

  const handleRowClick = (row: Record<string, unknown>) => {
    openEdit(row);
  };

  const handleSubmit = async () => {
    const id = selectedRow?.[idKey] as string | undefined;
    const url = id ? `${endpoint.replace(/\/$/, "")}/${id}` : endpoint.replace(/\/$/, "");
    const method = id ? "PUT" : "POST";
    setSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formValues),
      });
      if (res.ok) {
        setModalMode(null);
        setSelectedRow(null);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = row[idKey];
    if (id == null) return;
    setSaving(true);
    try {
      const res = await fetch(`${endpoint.replace(/\/$/, "")}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDeleteConfirm(null);
        setModalMode(null);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: CrudField) => {
    const value = formValues[field.key];
    const common = {
      label: field.label,
      disabled: modalMode === "detail",
    };
    switch (field.type) {
      case "number":
        return (
          <NumberInput
            key={field.key}
            {...common}
            value={typeof value === "number" ? value : value != null ? Number(value) : null}
            onChange={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
          />
        );
      case "date":
        return (
          <DateInput
            key={field.key}
            {...common}
            value={value instanceof Date ? value : value != null ? String(value) : null}
            onChange={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
          />
        );
      case "select":
        return (
          <Selectbox
            key={field.key}
            {...common}
            options={field.options ?? []}
            value={value != null ? String(value) : null}
            onChange={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
            placeholder={`Choisir ${field.label}...`}
          />
        );
      case "textarea":
        return (
          <Textarea
            key={field.key}
            {...common}
            value={value != null ? String(value) : ""}
            onChange={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
          />
        );
      case "boolean":
        return (
          <Toggle
            key={field.key}
            {...common}
            value={value === true || value === "true"}
            onChange={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
          />
        );
      default:
        return (
          <Input
            key={field.key}
            {...common}
            type={field.type === "text" ? "text" : "text"}
            value={value != null ? String(value) : ""}
            onChange={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
          />
        );
    }
  };

  const isDetail = modalMode === "detail";
  const isForm = modalMode === "create" || modalMode === "edit";

  return (
    <div className="bpm-crud-page" style={{ padding: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--bpm-text-primary)", margin: 0 }}>
          {title}
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Input
            type="search"
            placeholder="Rechercher..."
            value={search}
            onChange={setSearch}
            style={{ minHeight: 40, height: 40, boxSizing: "border-box" }}
          />
          <Button variant="primary" size="small" onClick={openCreate} className="!min-h-[40px] !h-[40px]">
            Nouveau
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size="medium" />
        </div>
      ) : (
        <>
          <Table
            columns={tableColumns}
            data={pageData}
            onRowClick={handleRowClick}
            keyColumn={idKey}
            hover
          />
          {filteredData.length > PAGE_SIZE && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={PAGE_SIZE}
                totalItems={filteredData.length}
                label={`Page ${currentPage} / ${totalPages}`}
              />
            </div>
          )}
        </>
      )}

      {/* Modal création / édition / détail */}
      <Modal
        isOpen={isForm || isDetail}
        onClose={() => { setModalMode(null); setSelectedRow(null); setDeleteConfirm(null); }}
        title={isDetail ? "Détail" : selectedRow ? "Modifier" : "Nouveau"}
        size="medium"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {fields.map(renderField)}
          {!isDetail && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <Button variant="secondary" size="small" onClick={() => setModalMode(null)}>
                Annuler
              </Button>
              <Button variant="primary" size="small" onClick={handleSubmit} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              {selectedRow && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setDeleteConfirm(selectedRow)}
                  disabled={saving}
                  className="ml-auto"
                >
                  Supprimer
                </Button>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
        size="small"
      >
        <p style={{ color: "var(--bpm-text-secondary)", margin: "0 0 16px 0" }}>
          Êtes-vous sûr de vouloir supprimer cet élément ?
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" size="small" onClick={() => setDeleteConfirm(null)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            disabled={saving}
          >
            {saving ? "Suppression…" : "Supprimer"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
