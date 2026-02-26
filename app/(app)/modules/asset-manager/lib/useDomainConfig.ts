"use client";

import { useState, useEffect } from "react";

export interface DomainField {
  key: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
  searchable?: boolean;
  show_in_list?: boolean;
}

export interface AssetTypeConfig {
  id: string;
  label: string;
  icon: string;
  fields: DomainField[];
}

export interface StatusConfig {
  id: string;
  label: string;
  color: string;
  terminal?: boolean;
}

export interface PriorityConfig {
  id: string;
  label: string;
  sla_hours: number;
  color: string;
}

export interface TicketCategoryConfig {
  id: string;
  label: string;
  subcategories: string[];
}

export interface DomainConfig {
  domain_id: string;
  domain_label: string;
  domain_icon: string;
  asset_label_singular: string;
  asset_label_plural: string;
  ticket_label_singular: string;
  assignment_label: string;
  asset_id_prefix: string;
  asset_types: AssetTypeConfig[];
  statuses: StatusConfig[];
  ticket_categories: TicketCategoryConfig[];
  ticket_types: string[];
  priorities: PriorityConfig[];
  numbering: { asset: string; ticket: string; assignment: string };
}

export function useDomainConfig(domainId: string | null) {
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [isLoading, setIsLoading] = useState(!!domainId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!domainId) {
      setConfig(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Config introuvable");
        return res.json();
      })
      .then(setConfig)
      .catch((e) => setError(e instanceof Error ? e : new Error("Erreur")))
      .finally(() => setIsLoading(false));
  }, [domainId]);

  const getStatusLabel = (id: string) => config?.statuses?.find((s) => s.id === id)?.label ?? id;
  const getStatusColor = (id: string) => config?.statuses?.find((s) => s.id === id)?.color ?? "gray";
  const getFieldsForType = (typeId: string) =>
    config?.asset_types?.find((t) => t.id === typeId)?.fields ?? [];
  const getAssetTypeLabel = (typeId: string) =>
    config?.asset_types?.find((t) => t.id === typeId)?.label ?? typeId;

  return {
    config,
    isLoading,
    error,
    getStatusLabel,
    getStatusColor,
    getFieldsForType,
    getAssetTypeLabel,
    getAssetTypes: () => config?.asset_types ?? [],
    getStatuses: () => config?.statuses ?? [],
    getPriorities: () => config?.priorities ?? [],
    getTicketCategories: () => config?.ticket_categories ?? [],
  };
}
