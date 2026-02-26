import path from "path";
import fs from "fs";

export type DomainConfig = {
  domain_id: string;
  domain_label: string;
  domain_icon: string;
  asset_label_singular: string;
  asset_label_plural: string;
  ticket_label_singular: string;
  assignment_label: string;
  asset_id_prefix: string;
  asset_types: {
    id: string;
    label: string;
    icon: string;
    fields: {
      key: string;
      label: string;
      type: string;
      options?: string[];
      required?: boolean;
      searchable?: boolean;
      show_in_list?: boolean;
    }[];
  }[];
  statuses: { id: string; label: string; color: string; terminal?: boolean }[];
  ticket_categories: { id: string; label: string; subcategories: string[] }[];
  ticket_types: string[];
  priorities: { id: string; label: string; sla_hours: number; color: string }[];
  assignment_requires_signature?: boolean;
  numbering: {
    asset: string;
    ticket: string;
    assignment: string;
  };
};

const CONFIG_DIR = path.join(process.cwd(), "lib", "asset-manager", "config");
const DOMAINS = ["it", "maintenance"] as const;

export function getAvailableDomainIds(): string[] {
  return [...DOMAINS];
}

export function loadDomainConfig(domainId: string): DomainConfig | null {
  const normalized = domainId.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!DOMAINS.includes(normalized as (typeof DOMAINS)[number])) return null;
  const filePath = path.join(CONFIG_DIR, `domain.${normalized}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as DomainConfig;
  } catch {
    return null;
  }
}
