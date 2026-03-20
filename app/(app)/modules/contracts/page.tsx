"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, Spinner, Selectbox, Panel, Button, ConfirmModal } from "@/components/bpm";
import { getTypeLabel, getStatusLabel, getRiskLabel, getWorkspaceLabel } from "@/lib/contracts/labels";

// Fonction helper pour afficher des toasts
function showToast(message: string, type: "success" | "error" | "info" | "warning" = "info") {
  const event = new CustomEvent("bpm-notification-toast", {
    detail: { message, type, id: Date.now() },
  });
  window.dispatchEvent(event);
}

// Icônes SVG inline
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M460-336.92v-346l-93.23 93.23-28.31-28.77L480-760l141.54 141.54-28.31 28.77L500-682.92v346h-40ZM264.62-200q-27.62 0-46.12-18.5Q200-237 200-264.62v-96.92h40v96.92q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h430.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-96.92h40v96.92q0 27.62-18.5 46.12Q723-200 695.38-200H264.62Z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M480-336.92 338.46-478.46l28.31-28.77L460-414v-346h40v346l93.23-93.23 28.31 28.77L480-336.92ZM264.62-200q-27.62 0-46.12-18.5Q200-237 200-264.62v-96.92h40v96.92q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h430.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-96.92h40v96.92q0 27.62-18.5 46.12Q723-200 695.38-200H264.62Z" />
    </svg>
  );
}

function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M304.62-160q-26.85 0-45.74-18.88Q240-197.77 240-224.62V-720h-40v-40h160v-30.77h240V-760h160v40h-40v495.38q0 27.62-18.5 46.12Q683-160 655.38-160H304.62ZM680-720H280v495.38q0 10.77 6.92 17.7 6.93 6.92 17.7 6.92h350.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93V-720ZM392.31-280h40v-360h-40v360Zm135.38 0h40v-360h-40v360ZM280-720v520-520Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function FileIcon({ ext, className }: { ext: string; className?: string }) {
  const isPdf = ext.toLowerCase() === "pdf";
  const isDocx = ext.toLowerCase() === "docx" || ext.toLowerCase() === "doc";
  const isTxt = ext.toLowerCase() === "txt";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isPdf ? "#dc2626" : isDocx ? "#2563eb" : isTxt ? "#64748b" : "currentColor"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {isPdf && <path d="M10 12h4M10 16h4M8 20h8" />}
    </svg>
  );
}


function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M224.62-160q-27.62 0-46.12-18.5Q160-197 160-224.62v-510.76q0-27.62 18.5-46.12Q197-800 224.62-800h335.46l-40 40H224.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v510.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h510.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-299.53l40-40v339.53q0 27.62-18.5 46.12Q763-160 735.38-160H224.62ZM480-480Zm-80 80v-104.62l357.77-357.76q6.61-6.62 13.92-9.16t15.39-2.54q7.54 0 14.73 2.54t13.04 8.39L859.31-820q6.38 6.62 9.69 14.58 3.31 7.96 3.31 16.04 0 8.07-2.43 15.26-2.42 7.2-9.03 13.81L500.77-400H400Zm432.54-388.62-44.46-46.76 44.46 46.76ZM440-440h43.69l266.62-266.62-21.85-21.84-24.38-23.39L440-487.77V-440Zm288.46-288.46-24.38-23.39 24.38 23.39 21.85 21.84-21.85-21.84Z" />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M355.27-145.04q-58.19-25.04-101.69-68.54-43.5-43.5-68.54-101.69Q160-373.46 160-440h40q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-15.23l65.08 65.08-28.31 28.77-113.85-114.62 115.39-114.62 28.3 28.77L464.77-760H480q66.54 0 124.73 25.04t101.69 68.54q43.5 43.5 68.54 101.69Q800-506.54 800-440t-25.04 124.73q-25.04 58.19-68.54 101.69-43.5 43.5-101.69 68.54Q546.54-120 480-120t-124.73-25.04Z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M355.27-145.04q-58.19-25.04-101.69-68.54-43.5-43.5-68.54-101.69Q160-373.46 160-440h40q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-15.23l65.08 65.08-28.31 28.77-113.85-114.62 115.39-114.62 28.3 28.77L464.77-760H480q66.54 0 124.73 25.04t101.69 68.54q43.5 43.5 68.54 101.69Q800-506.54 800-440t-25.04 124.73q-25.04 58.19-68.54 101.69-43.5 43.5-101.69 68.54Q546.54-120 480-120t-124.73-25.04Z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className} aria-hidden="true">
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </svg>
  );
}

type Extracted = { supplier_name?: string; contract_date?: string; end_date?: string; termination_date?: string; overall_risk_level?: string };

interface ContractRow {
  id: string;
  title: string;
  contractType: string;
  workspace: string;
  originalFilename: string;
  status: string;
  analysisProgress: number;
  extractedData?: Extracted | null;
  supplier_name?: string | null;
  contract_date?: string | null;
  end_date?: string | null;
  termination_date?: string | null;
  overall_risk_level?: string | null;
  createdAt: string;
}

function flattenContract(c: ContractRow): ContractRow {
  const ex = c.extractedData as Extracted | null | undefined;
  return {
    ...c,
    supplier_name: c.supplier_name ?? ex?.supplier_name ?? null,
    contract_date: c.contract_date ?? ex?.contract_date ?? null,
    end_date: c.end_date ?? ex?.end_date ?? null,
    termination_date: c.termination_date ?? ex?.termination_date ?? null,
    overall_risk_level: c.overall_risk_level ?? ex?.overall_risk_level ?? null,
    executive_summary: c.executive_summary ?? ex?.executive_summary ?? null,
  };
}

const WORKSPACES = [
  { value: "", label: "Tous les workspaces" },
  { value: "service1", label: getWorkspaceLabel("service1") },
  { value: "service2", label: getWorkspaceLabel("service2") },
];
const TYPES = [
  { value: "", label: "Tous les types" },
  { value: "prestation", label: "Prestation de service" },
  { value: "licence", label: "Licence / SaaS" },
  { value: "cgv", label: "CGV / CGU" },
  { value: "nda", label: "NDA / Confidentialité" },
  { value: "bail", label: "Bail / Location" },
  { value: "partenariat", label: "Partenariat" },
  { value: "emploi", label: "Contrat d'emploi" },
  { value: "achat", label: "Achat / Fournisseur" },
  { value: "other", label: "Autre" },
];
const STATUSES = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: getStatusLabel("pending") },
  { value: "analyzing", label: getStatusLabel("analyzing") },
  { value: "done", label: getStatusLabel("done") },
  { value: "error", label: getStatusLabel("error") },
];

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [workspace, setWorkspace] = useState("");
  const [contractType, setContractType] = useState("");
  const [status, setStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [detailContract, setDetailContract] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; filename: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropOverlayRef = useRef<HTMLDivElement>(null);

  // Détecter la taille d'écran pour le responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchContracts = useCallback(() => {
    const params = new URLSearchParams();
    if (workspace) params.set("workspace", workspace);
    if (contractType) params.set("contractType", contractType);
    if (status) params.set("status", status);
    fetch(`/api/contracts?${params}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          console.error("[contracts] API error:", r.status, r.statusText);
          return [];
        }
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setContracts(list.map((c: ContractRow) => flattenContract(c)));
        setLoading(false);
      })
      .catch((err) => {
        console.error("[contracts] Fetch error:", err);
        setContracts([]);
        setLoading(false);
      });
  }, [workspace, contractType, status]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    const hasAnalyzing = contracts.some((c) => c.status === "analyzing" || c.status === "pending");
    if (!hasAnalyzing) return;
    const interval = setInterval(fetchContracts, 3000);
    return () => clearInterval(interval);
  }, [contracts, fetchContracts]);

  // Masquer la barre de navigation mobile quand le panneau de détail est ouvert
  useEffect(() => {
    if (detailPanelOpen) {
      document.body.classList.add("contract-detail-panel-open");
    } else {
      document.body.classList.remove("contract-detail-panel-open");
    }
    return () => {
      document.body.classList.remove("contract-detail-panel-open");
    };
  }, [detailPanelOpen]);

  // Drag and drop global avec dragCounter pour éviter les faux dragLeave
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounter++;
        if (dragCounter === 1) {
          setIsDragging(true);
          if (dropOverlayRef.current) {
            dropOverlayRef.current.classList.add("active");
          }
          // Ouvrir automatiquement la modal d'import si pas déjà ouverte
          if (!importModalOpen) {
            setImportModalOpen(true);
          }
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
        if (dropOverlayRef.current) {
          dropOverlayRef.current.classList.remove("active");
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
      if (dropOverlayRef.current) {
        dropOverlayRef.current.classList.remove("active");
      }
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files).slice(0, 10);
        setSelectedFiles(files);
        setImportModalOpen(true);
      }
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [importModalOpen]);

  const handleReanalyze = async (id: string) => {
    if (reanalyzingId) return;
    setReanalyzingId(id);
    try {
      const res = await fetch(`/api/contracts/${id}/reanalyze`, { method: "POST", credentials: "include" });
      if (res.ok) {
        fetchContracts();
        showToast("Réanalyse du contrat lancée", "info");
      } else {
        showToast("Erreur lors de la réanalyse", "error");
      }
    } finally {
      setReanalyzingId(null);
    }
  };

  const handleDeleteClick = useCallback((id: string, filename: string) => {
    setDeleteConfirm({ id, filename });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm || deletingId) return;
    const { id, filename } = deleteConfirm;
    setDeletingId(id);
    setDeleteConfirm(null);
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setContracts((prev) => prev.filter((c) => c.id !== id));
        if (selectedContractId === id) {
          setDetailPanelOpen(false);
          setSelectedContractId(null);
        }
        showToast(`Contrat « ${filename} » supprimé`, "success");
      } else {
        const err = await res.json().catch(() => ({}));
        const errorMsg = (err && typeof err === "object" && "error" in err && typeof (err as { error?: string }).error === "string") ? (err as { error: string }).error : "Erreur lors de la suppression.";
        showToast(errorMsg, "error");
      }
    } finally {
      setDeletingId(null);
    }
  }, [deleteConfirm, deletingId, selectedContractId]);

  const handleAnalyze = async (files: File[]) => {
    if (files.length === 0) return;
    const ws = workspace || "service1";
    const ct = contractType || "other";
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workspace", ws);
        formData.append("contractType", ct);
        const res = await fetch("/api/contracts", { method: "POST", body: formData, credentials: "include" });
        if (res.ok) {
          const created = await res.json();
          setContracts((prev) => [flattenContract(created as ContractRow), ...prev]);
          showToast(`Contrat « ${file.name} » importé et en cours d'analyse`, "success");
        } else {
          if (res.status === 413) {
            showToast("Fichier trop volumineux pour l'upload (limite du serveur). Réduisez la taille du fichier ou compressez le PDF.", "error");
            continue;
          }
          const err = await res.json().catch(() => ({}));
          const msg = (err && typeof err === "object" && "error" in err && typeof (err as { error?: string }).error === "string")
            ? (err as { error: string }).error
            : res.status === 401
              ? "Non autorisé. Connectez-vous pour importer des contrats."
              : `Erreur upload (${res.status})`;
          showToast(msg, "error");
        }
      }
      setImportModalOpen(false);
      setSelectedFiles([]);
    } finally {
      setUploading(false);
    }
  };

  const openContractDetail = useCallback(async (id: string) => {
    setSelectedContractId(id);
    setDetailPanelOpen(true);
    setDetailLoading(true);
    setIsEditMode(false);
    try {
      const res = await fetch(`/api/contracts/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDetailContract(data);
        setEditFormData({
          supplier_name: (data.extractedData?.supplier_name && data.extractedData.supplier_name !== "null" && data.extractedData.supplier_name !== "undefined") ? data.extractedData.supplier_name : "",
          buyer_name: (data.extractedData?.buyer_name && data.extractedData.buyer_name !== "null" && data.extractedData.buyer_name !== "undefined") ? data.extractedData.buyer_name : "",
          contract_date: (data.extractedData?.contract_date && data.extractedData.contract_date !== "null" && data.extractedData.contract_date !== "undefined") ? data.extractedData.contract_date : "",
          end_date: (data.extractedData?.end_date && data.extractedData.end_date !== "null" && data.extractedData.end_date !== "undefined") ? data.extractedData.end_date : "",
          termination_date: (data.extractedData?.termination_date && data.extractedData.termination_date !== "null" && data.extractedData.termination_date !== "undefined") ? data.extractedData.termination_date : "",
          contractType: data.contractType || "",
        });
      } else {
        setDetailContract(null);
      }
    } catch (err) {
      console.error("[contracts] Detail fetch error:", err);
      setDetailContract(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedContractId || !detailContract) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${selectedContractId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contractType: editFormData.contractType,
          extractedData: {
            ...detailContract.extractedData,
            supplier_name: editFormData.supplier_name || null,
            buyer_name: editFormData.buyer_name || null,
            contract_date: editFormData.contract_date || null,
            end_date: editFormData.end_date || null,
            termination_date: editFormData.termination_date || null,
          },
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDetailContract(updated);
        setIsEditMode(false);
        fetchContracts(); // Rafraîchir la liste
      } else {
        const err = await res.json().catch(() => ({}));
        alert((err && typeof err === "object" && "error" in err && typeof (err as { error?: string }).error === "string") ? (err as { error: string }).error : "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      console.error("[contracts] Save error:", err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }, [selectedContractId, detailContract, editFormData, fetchContracts]);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    if (detailContract) {
      setEditFormData({
        supplier_name: (detailContract.extractedData?.supplier_name && detailContract.extractedData.supplier_name !== "null" && detailContract.extractedData.supplier_name !== "undefined") ? detailContract.extractedData.supplier_name : "",
        buyer_name: (detailContract.extractedData?.buyer_name && detailContract.extractedData.buyer_name !== "null" && detailContract.extractedData.buyer_name !== "undefined") ? detailContract.extractedData.buyer_name : "",
        contract_date: (detailContract.extractedData?.contract_date && detailContract.extractedData.contract_date !== "null" && detailContract.extractedData.contract_date !== "undefined") ? detailContract.extractedData.contract_date : "",
        end_date: (detailContract.extractedData?.end_date && detailContract.extractedData.end_date !== "null" && detailContract.extractedData.end_date !== "undefined") ? detailContract.extractedData.end_date : "",
        termination_date: (detailContract.extractedData?.termination_date && detailContract.extractedData.termination_date !== "null" && detailContract.extractedData.termination_date !== "undefined") ? detailContract.extractedData.termination_date : "",
        contractType: detailContract.contractType || "",
      });
    }
  }, [detailContract]);

  const stats = useMemo(() => {
    const total = contracts.length;
    const analyzed = contracts.filter((c) => c.status === "done").length;
    const pending = contracts.filter((c) => c.status === "pending" || c.status === "analyzing").length;
    const highRisk = contracts.filter((c) => c.overall_risk_level === "high").length;
    return { total, analyzed, pending, highRisk };
  }, [contracts]);

  const hasActiveFilters = workspace || contractType || status || searchText.trim();

  const columns = useMemo(
    () => [
      {
        key: "originalFilename",
        label: "Nom du fichier",
        render: (val: unknown) => {
          const filename = String(val ?? "");
          const ext = getFileExtension(filename);
          return (
            <span className="file-name-cell">
              <span className={`file-icon ${ext.toLowerCase()}`} aria-hidden="true">
                <FileIcon ext={ext} className="w-5 h-5" />
              </span>
              <span className="file-name" title={filename}>
                {filename}
              </span>
            </span>
          );
        },
      },
      {
        key: "supplier_name",
        label: "Fournisseur",
        render: (val: unknown) => {
          const v = String(val ?? "");
          if (v === "-" || !v || v === "null" || v === "undefined") {
            return <span className="data-empty" aria-label="Non renseigné">—</span>;
          }
          return v;
        },
      },
      {
        key: "executive_summary",
        label: "Objet du contrat",
        render: (val: unknown) => {
          const v = String(val ?? "");
          if (v === "-" || !v || v === "null" || v === "undefined" || v === "Résumé non extrait.") {
            return <span className="data-empty" aria-label="Non renseigné">—</span>;
          }
          // Tronquer à 100 caractères avec ellipsis
          const truncated = v.length > 100 ? v.substring(0, 100) + "…" : v;
          return <span title={v}>{truncated}</span>;
        },
      },
      {
        key: "contractType",
        label: "Type",
        render: (val: unknown) => {
          const v = String(val ?? "");
          return v === "-" ? <span className="data-empty">—</span> : getTypeLabel(v);
        },
      },
      {
        key: "contract_date",
        label: "Date contrat",
        render: (val: unknown) => {
          const v = String(val ?? "");
          if (v === "-" || !v || v === "null" || v === "undefined") {
            return <span className="data-empty" aria-label="Non renseigné">—</span>;
          }
          return v;
        },
      },
      {
        key: "end_date",
        label: "Date de fin",
        render: (val: unknown) => {
          const v = String(val ?? "");
          if (v === "-" || !v || v === "null" || v === "undefined") {
            return <span className="data-empty" aria-label="Non renseigné">—</span>;
          }
          return v;
        },
      },
      {
        key: "overall_risk_level",
        label: "Risque",
        render: (val: unknown) => {
          const v = String(val ?? "");
          if (v === "-" || !v || v === "null" || v === "undefined") {
            return <span className="data-empty" aria-label="Non renseigné">—</span>;
          }
          const label = getRiskLabel(v);
          const riskClass = v === "low" ? "risk-low" : v === "medium" ? "risk-medium" : v === "high" ? "risk-high" : "risk-unknown";
          return (
            <span className={`risk-badge ${riskClass}`} aria-label={`Risque : ${label}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8" aria-hidden="true">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {label}
            </span>
          );
        },
      },
      {
        key: "status",
        label: "Statut",
        render: (val: unknown, row: Record<string, unknown>) => {
          const statusKey = (row.statusKey as string) ?? String(val ?? "");
          const s = String(val ?? "");
          const id = row.id as string | undefined;
          const isError = statusKey === "error";
          const isAnalyzing = statusKey === "analyzing";
          const isReanalyzing = id && reanalyzingId === id;
          const { label } = statusBadgeStyle(statusKey);
          const displayLabel = s.startsWith("En cours (") ? s : label;
          const statusClass = statusKey === "done" ? "status-analyzed" : statusKey === "pending" || statusKey === "analyzing" ? "status-pending" : statusKey === "error" ? "status-error" : "status-importing";
          return (
            <span className="flex items-center gap-2 flex-wrap">
              <span className={`status-badge ${statusClass}`}>
                {isAnalyzing && (
                  <span className="animate-spin text-xs inline-block mr-1" aria-hidden="true">
                    ⟳
                  </span>
                )}
                {!isAnalyzing && statusKey === "done" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{displayLabel}</span>
              </span>
              {isError && id && (
                <span onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={!!reanalyzingId}
                    onClick={() => handleReanalyze(id)}
                    aria-label={`Relancer l'analyse du contrat ${row.originalFilename as string}`}
                  >
                    {isReanalyzing ? "…" : "Relancer"}
                  </Button>
                </span>
              )}
            </span>
          );
        },
      },
    ],
    [reanalyzingId, handleReanalyze]
  );

  function statusBadgeStyle(s: string): { bg: string; label: string } {
    switch (s) {
      case "pending": return { bg: "var(--bpm-warning-soft)", label: getStatusLabel("pending") };
      case "analyzing": return { bg: "var(--bpm-accent-soft)", label: getStatusLabel("analyzing") };
      case "done": return { bg: "var(--bpm-success-soft)", label: getStatusLabel("done") };
      case "error": return { bg: "var(--bpm-error-soft)", label: getStatusLabel("error") };
      default: return { bg: "var(--bpm-text-secondary)", label: getStatusLabel(s) };
    }
  }

  const filteredContracts = searchText.trim()
    ? contracts.filter((c) =>
        c.originalFilename.toLowerCase().includes(searchText.trim().toLowerCase()) ||
        (c.supplier_name && c.supplier_name.toLowerCase().includes(searchText.trim().toLowerCase()))
      )
    : contracts;

  const data = filteredContracts.map((c) => ({
    id: c.id,
    originalFilename: c.originalFilename,
    supplier_name: c.supplier_name ?? "-",
    contractType: c.contractType,
    contract_date: c.contract_date ?? "-",
    end_date: c.end_date ?? "-",
    overall_risk_level: c.overall_risk_level ?? "-",
    statusKey: c.status,
    analysisProgress: c.analysisProgress ?? 0,
    status: c.status === "analyzing" ? `${getStatusLabel("analyzing")} (${c.analysisProgress ?? 0}%)` : getStatusLabel(c.status),
  }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 10);
      setSelectedFiles(files);
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).slice(0, 10);
      setSelectedFiles(files);
    }
  };

  return (
    <>
      <div className="doc-page contracts-page">
        {/* En-tête */}
        <div className="contracts-header">
          <div className="contracts-header-left">
            <nav className="doc-breadcrumb" aria-label="Fil d'Ariane">
              <Link href="/modules">Modules</Link> <span aria-hidden>›</span> Base contractuelle
            </nav>
            <h1>Base contractuelle</h1>
            <p className="doc-description">
              Analysez vos contrats fournisseurs avec l&apos;IA pour identifier les risques et dates clés.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setImportModalOpen(true)}
            className="contracts-import-btn"
            aria-label="Importer un contrat"
          >
            Importer
          </Button>
        </div>

        {/* Barre de stats */}
        <div className="contracts-stats" aria-label="Vue d'ensemble">
          <div className="stat-card">
            <span className="stat-value" data-stat="total">{stats.total}</span>
            <span className="stat-label">Contrat(s)</span>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-success" data-stat="analyzed">{stats.analyzed}</span>
            <span className="stat-label">Analysé(s)</span>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-warning" data-stat="pending">{stats.pending}</span>
            <span className="stat-label">En attente</span>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-error" data-stat="alerts">{stats.highRisk}</span>
            <span className="stat-label">Alertes risque</span>
          </div>
        </div>

        {/* Toolbar - Recherche + Filtres */}
        <div className="contracts-toolbar" role="search">
          <div className="search-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="search"
              className="contracts-search"
              placeholder="Rechercher un contrat, fournisseur…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              aria-label="Rechercher dans les contrats"
            />
          </div>
          <div className="contracts-filters">
            <Selectbox
              options={TYPES}
              value={contractType}
              onChange={(v) => setContractType(v ?? "")}
              placeholder="Type"
            />
            <Selectbox
              options={STATUSES}
              value={status}
              onChange={(v) => setStatus(v ?? "")}
              placeholder="Statut"
            />
            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setWorkspace("");
                  setContractType("");
                  setStatus("");
                  setSearchText("");
                }}
                aria-label="Réinitialiser les filtres"
              >
                <ResetIcon className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="medium" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="contracts-table-wrapper">
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <p className="empty-title">Aucun contrat importé</p>
              <p className="empty-desc">
                Glissez vos fichiers PDF, DOCX ou TXT directement ici, ou cliquez sur &quot;Importer&quot;.
              </p>
              <Button
                variant="primary"
                onClick={() => setImportModalOpen(true)}
                aria-label="Importer un premier contrat"
              >
                Importer un premier contrat
              </Button>
            </div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <Panel variant="info" title="Aucun résultat">
            Aucun contrat ne correspond à &quot;{searchText}&quot;. Modifiez la recherche ou les filtres.
          </Panel>
        ) : isMobile ? (
          <div className="contracts-mobile-list">
            {data.map((row) => {
              const id = (row as { id?: string }).id;
              const filename = String(row.originalFilename ?? "");
              const supplier = String(row.supplier_name ?? "");
              const contractDate = String(row.contract_date ?? "");
              const endDate = String(row.end_date ?? "");
              const risk = String(row.overall_risk_level ?? "");
              const statusKey = (row.statusKey as string) ?? String(row.status ?? "");
              return (
                <div
                  key={id}
                  className="contract-card"
                  onClick={() => id && openContractDetail(id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && id) {
                      e.preventDefault();
                      openContractDetail(id);
                    }
                  }}
                  aria-label={`Voir le détail de ${filename}`}
                >
                  <div className="contract-card-header">
                    <FileIcon ext={getFileExtension(filename)} className="w-5 h-5" />
                    <span className="contract-card-title">{filename}</span>
                  </div>
                  <div className="contract-card-meta">
                    {supplier && supplier !== "null" && supplier !== "undefined" && (
                      <div><strong>Fournisseur:</strong> {supplier}</div>
                    )}
                    {contractDate && contractDate !== "null" && contractDate !== "undefined" && (
                      <div><strong>Date:</strong> {contractDate}</div>
                    )}
                    {endDate && endDate !== "null" && endDate !== "undefined" && (
                      <div><strong>Fin:</strong> {endDate}</div>
                    )}
                    {risk && risk !== "null" && risk !== "undefined" && (
                      <div>
                        <strong>Risque:</strong>{" "}
                        <span className={`risk-badge ${risk === "low" ? "risk-low" : risk === "medium" ? "risk-medium" : risk === "high" ? "risk-high" : "risk-unknown"}`} aria-label={`Risque : ${getRiskLabel(risk)}`}>
                          {getRiskLabel(risk)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="contracts-table-wrapper">
              <Table
                columns={columns}
                data={data}
                defaultSortColumn="end_date"
                defaultSortDirection="desc"
                onRowClick={(row) => {
                  const id = (row as { id?: string }).id;
                  if (id) openContractDetail(id);
                }}
                emptyMessage="Aucune donnée disponible"
                className="contracts-table"
              />
            </div>
          </>
        )}
      </div>

      {/* Overlay drag-and-drop global */}
      <div className="drop-overlay" ref={dropOverlayRef} aria-hidden="true" role="region" aria-label="Zone de dépôt active">
        <div className="drop-overlay-content">
          <UploadIcon className="drop-overlay-icon" />
          <p className="drop-overlay-title">Déposez vos fichiers</p>
          <p className="drop-overlay-sub">PDF, DOCX ou TXT — jusqu&apos;à 10 fichiers</p>
        </div>
      </div>

      {/* Modal d'import */}
      {importModalOpen && (
        <div 
          className="contracts-import-modal" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="import-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setImportModalOpen(false);
              setSelectedFiles([]);
            }
          }}
        >
          <div className="import-modal-overlay" onClick={() => setImportModalOpen(false)} />
          <div className="import-modal-panel">
            <div className="import-modal-header">
              <h2 id="import-modal-title">Importer des contrats</h2>
              <button className="modal-close-btn" onClick={() => setImportModalOpen(false)} aria-label="Fermer">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="import-modal-body">
              <div
                className="dropzone"
                onClick={handleDropzoneClick}
                onDrop={handleDropzoneDrop}
                onDragOver={(e) => e.preventDefault()}
                role="button"
                tabIndex={0}
              >
                <UploadIcon className="dropzone-icon" />
                <p className="dropzone-title">Glissez-déposez vos fichiers ici</p>
                <p className="dropzone-sub">ou</p>
                <Button variant="secondary" onClick={() => handleDropzoneClick()}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2" aria-hidden="true">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  Choisir des fichiers
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  multiple
                  onChange={handleFileSelect}
                />
                <div className="dropzone-formats">
                  <span className="format-tag">PDF</span>
                  <span className="format-tag">DOCX</span>
                  <span className="format-tag">TXT</span>
                  <span className="format-limit">Max 10 fichiers</span>
                </div>
              </div>
              {selectedFiles.length > 0 && (
                <div className="import-file-list">
                  <p className="import-file-list-title">{selectedFiles.length} fichier{selectedFiles.length > 1 ? "s" : ""} sélectionné{selectedFiles.length > 1 ? "s" : ""}</p>
                  <ul className="import-file-list-items">
                    {selectedFiles.map((file, i) => (
                      <li key={i} className="import-file-item">
                        <FileIcon ext={getFileExtension(file.name)} className="w-4 h-4" />
                        <span className="import-file-name">{file.name}</span>
                        <button
                          type="button"
                          className="import-file-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          aria-label={`Retirer ${file.name}`}
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="import-modal-footer">
              <Button variant="secondary" onClick={() => { setImportModalOpen(false); setSelectedFiles([]); }}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={() => handleAnalyze(selectedFiles)}
                disabled={uploading || selectedFiles.length === 0}
                aria-label={selectedFiles.length === 0 ? "Sélectionnez au moins un fichier pour continuer" : "Analyser les documents"}
              >
                {uploading ? (
                  "Analyse en cours..."
                ) : (
                  <>
                    Analyser les documents
                    {selectedFiles.length > 0 && <span className="btn-file-count"> ({selectedFiles.length})</span>}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau détail (slide-over) */}
      {detailPanelOpen && (
        <div 
          className="contract-detail-panel" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="detail-panel-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDetailPanelOpen(false);
              setSelectedContractId(null);
              setIsEditMode(false);
            }
          }}
        >
          <div className="detail-panel-overlay" onClick={() => { setDetailPanelOpen(false); setSelectedContractId(null); setIsEditMode(false); }} />
          <div className={`detail-panel-drawer ${isEditMode ? "edit-mode" : ""}`}>
            <div className="detail-panel-header">
              <button className="detail-close-btn" onClick={() => { setDetailPanelOpen(false); setSelectedContractId(null); setIsEditMode(false); }} aria-label="Fermer le détail">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h2 id="detail-panel-title" className="detail-title">
                {detailContract?.originalFilename || "Chargement..."}
              </h2>
              <div className="detail-header-actions">
                {selectedContractId && detailContract && !isEditMode && (
                  <>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        if (selectedContractId) {
                          handleReanalyze(selectedContractId);
                          setDetailLoading(true);
                          setTimeout(() => {
                            openContractDetail(selectedContractId);
                          }, 1000);
                        }
                      }}
                      aria-label="Réanalyser ce contrat"
                      disabled={reanalyzingId === selectedContractId}
                    >
                      <RefreshIcon className="w-4 h-4 mr-2" />
                      Réanalyser
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setIsEditMode(true)}
                      aria-label="Modifier ce contrat"
                    >
                      <EditIcon className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        if (selectedContractId && detailContract) {
                          handleDeleteClick(selectedContractId, detailContract.originalFilename);
                        }
                      }}
                      aria-label="Supprimer ce contrat"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="detail-panel-body">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="medium" />
                </div>
              ) : detailContract ? (
                <div className="detail-panel-content" style={{ padding: "20px" }}>
                  <div className="detail-meta-row mb-4" style={{ paddingBottom: "16px", borderBottom: "1px solid var(--bpm-border)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="detail-meta-workspace" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--bpm-text-muted)" }}>
                      <FolderIcon className="w-4 h-4" />
                      {getWorkspaceLabel(detailContract.workspace)}
                    </span>
                    <span className="detail-meta-separator" style={{ color: "var(--bpm-text-muted)", fontSize: "13px" }}>·</span>
                    <span className="detail-meta-type" style={{ fontSize: "13px", color: "var(--bpm-text-muted)" }}>
                      {getTypeLabel(detailContract.contractType)}
                    </span>
                    <span className="detail-meta-separator" style={{ color: "var(--bpm-text-muted)", fontSize: "13px" }}>·</span>
                    <span className={`status-badge ${detailContract.status === "done" ? "status-analyzed" : detailContract.status === "analyzing" ? "status-analyzing" : detailContract.status === "error" ? "status-error" : "status-pending"}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "4px 8px", borderRadius: "var(--bpm-radius-sm)" }}>
                      {detailContract.status === "done" && <CheckIcon className="w-3 h-3" />}
                      {getStatusLabel(detailContract.status)}
                    </span>
                    {detailContract.extractedData?.overall_risk_level && (
                      <span className={`risk-badge ${detailContract.extractedData.overall_risk_level === "low" ? "risk-low" : detailContract.extractedData.overall_risk_level === "high" ? "risk-high" : "risk-medium"}`} style={{ 
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "var(--bpm-radius-sm)",
                        backgroundColor: detailContract.extractedData.overall_risk_level === "low" ? "var(--bpm-success-soft)" : detailContract.extractedData.overall_risk_level === "high" ? "var(--bpm-error-soft)" : "var(--bpm-warning-soft)",
                        color: detailContract.extractedData.overall_risk_level === "low" ? "var(--bpm-success-text)" : detailContract.extractedData.overall_risk_level === "high" ? "var(--bpm-error-text)" : "var(--bpm-warning-text)"
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor" }} />
                        Risque {getRiskLabel(detailContract.extractedData.overall_risk_level)}
                      </span>
                    )}
                  </div>
                  {detailContract.extractedData ? (
                    <div className="detail-sections space-y-6">
                      {detailContract.extractedData.executive_summary && (
                        <section>
                          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Synthèse</h3>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-secondary)" }}>
                            {detailContract.extractedData.executive_summary}
                          </p>
                        </section>
                      )}
                      <section>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Parties</h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <label className="block mb-1" style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
                              Fournisseur :
                            </label>
                            {isEditMode ? (
                              <input
                                type="text"
                                className="detail-field-input"
                                value={editFormData.supplier_name || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, supplier_name: e.target.value })}
                                placeholder="Nom du fournisseur"
                              />
                            ) : (
                              <div style={{ color: "var(--bpm-text-secondary)" }}>
                                {detailContract.extractedData?.supplier_name && 
                                 detailContract.extractedData.supplier_name !== "null" && 
                                 detailContract.extractedData.supplier_name !== "undefined" &&
                                 detailContract.extractedData.supplier_name.trim() !== ""
                                  ? detailContract.extractedData.supplier_name
                                  : <span className="data-empty">—</span>}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block mb-1" style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
                              Acheteur :
                            </label>
                            {isEditMode ? (
                              <input
                                type="text"
                                className="detail-field-input"
                                value={editFormData.buyer_name || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, buyer_name: e.target.value })}
                                placeholder="Nom de l'acheteur"
                              />
                            ) : (
                              <div style={{ color: "var(--bpm-text-secondary)" }}>
                                {detailContract.extractedData?.buyer_name && 
                                 detailContract.extractedData.buyer_name !== "null" && 
                                 detailContract.extractedData.buyer_name !== "undefined" &&
                                 detailContract.extractedData.buyer_name.trim() !== ""
                                  ? detailContract.extractedData.buyer_name
                                  : <span className="data-empty">—</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                      <section>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Dates</h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <label className="block mb-1" style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
                              Date contrat :
                            </label>
                            {isEditMode ? (
                              <input
                                type="date"
                                className="detail-field-input"
                                value={editFormData.contract_date || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, contract_date: e.target.value })}
                              />
                            ) : (
                              <div style={{ color: "var(--bpm-text-secondary)" }}>
                                {detailContract.extractedData?.contract_date && 
                                 detailContract.extractedData.contract_date !== "null" && 
                                 detailContract.extractedData.contract_date !== "undefined" &&
                                 detailContract.extractedData.contract_date.trim() !== ""
                                  ? detailContract.extractedData.contract_date
                                  : <span className="data-empty">—</span>}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block mb-1" style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
                              Date de fin :
                            </label>
                            {isEditMode ? (
                              <input
                                type="date"
                                className="detail-field-input"
                                value={editFormData.end_date || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                              />
                            ) : (
                              <div style={{ color: "var(--bpm-text-secondary)" }}>
                                {detailContract.extractedData?.end_date && 
                                 detailContract.extractedData.end_date !== "null" && 
                                 detailContract.extractedData.end_date !== "undefined" &&
                                 detailContract.extractedData.end_date.trim() !== ""
                                  ? detailContract.extractedData.end_date
                                  : <span className="data-empty">—</span>}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block mb-1" style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
                              Date de dénonciation :
                            </label>
                            {isEditMode ? (
                              <input
                                type="date"
                                className="detail-field-input"
                                value={editFormData.termination_date || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, termination_date: e.target.value })}
                              />
                            ) : (
                              <div style={{ color: "var(--bpm-text-secondary)" }}>
                                {detailContract.extractedData?.termination_date && 
                                 detailContract.extractedData.termination_date !== "null" && 
                                 detailContract.extractedData.termination_date !== "undefined" &&
                                 detailContract.extractedData.termination_date.trim() !== ""
                                  ? detailContract.extractedData.termination_date
                                  : <span className="data-empty">—</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                      {isEditMode && (
                        <section>
                          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Type de contrat</h3>
                          <select
                            className="detail-field-input"
                            value={editFormData.contractType || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, contractType: e.target.value })}
                          >
                            <option value="">Sélectionner un type</option>
                            <option value="prestation">Prestation de service</option>
                            <option value="licence">Licence / SaaS</option>
                            <option value="cgv">CGV / CGU</option>
                            <option value="nda">NDA / Confidentialité</option>
                            <option value="bail">Bail / Location</option>
                            <option value="partenariat">Partenariat</option>
                            <option value="emploi">Contrat d'emploi</option>
                            <option value="achat">Achat / Fournisseur</option>
                            <option value="other">Autre</option>
                          </select>
                        </section>
                      )}
                      {detailContract.extractedData.key_risks && detailContract.extractedData.key_risks.length > 0 && (
                        <section>
                          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Risques</h3>
                          <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
                            {detailContract.extractedData.key_risks.map((r: string, i: number) => <li key={i}>{r}</li>)}
                          </ul>
                        </section>
                      )}
                      {detailContract.extractedData.action_items && detailContract.extractedData.action_items.length > 0 && (
                        <section>
                          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Actions recommandées</h3>
                          <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
                            {detailContract.extractedData.action_items.map((a: { action: string; deadline?: string; owner?: string }, i: number) => (
                              <li key={i}>
                                {a.action}
                                {a.deadline && ` (Échéance: ${a.deadline})`}
                                {a.owner && ` - Responsable: ${a.owner}`}
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm" style={{ color: "var(--bpm-text-muted)" }}>
                        {detailContract.status === "analyzing" || detailContract.status === "pending" 
                          ? "Analyse en cours..." 
                          : "Aucune donnée extraite. Lancez une ré-analyse si le contrat est déjà analysé."}
                      </p>
                      {(detailContract.status === "error" || detailContract.status === "done") && (
                        <Button
                          variant="secondary"
                          size="small"
                          className="mt-4"
                          onClick={async () => {
                            if (selectedContractId) {
                              setDetailLoading(true);
                              try {
                                const res = await fetch(`/api/contracts/${selectedContractId}/reanalyze`, { method: "POST", credentials: "include" });
                                if (res.ok) {
                                  openContractDetail(selectedContractId);
                                }
                              } finally {
                                setDetailLoading(false);
                              }
                            }
                          }}
                        >
                          Relancer l&apos;analyse
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="detail-error-state">
                  <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p className="error-title">Impossible de charger le détail</p>
                  <p className="error-desc">Une erreur s&apos;est produite lors du chargement de l&apos;analyse.</p>
                  <Button variant="secondary" onClick={() => selectedContractId && openContractDetail(selectedContractId)}>
                    Réessayer
                  </Button>
                </div>
              )}
            </div>
            {isEditMode && detailContract && (
              <div className="detail-panel-footer">
                <div className="detail-footer-actions">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        title="Supprimer ce contrat ?"
        message={deleteConfirm ? `"${deleteConfirm.filename}" sera définitivement supprimé. Cette action est irréversible.` : ""}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={!!deletingId}
      />
    </>
  );
}
