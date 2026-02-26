import path from "path";
import { readFileSync } from "fs";

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
  assignment_condition_tracking?: boolean;
  numbering?: {
    asset: string;
    ticket: string;
    assignment: string;
  };
};

const CONFIG_DIR = path.join(process.cwd(), "lib", "asset-manager", "config");
const KNOWN_DOMAINS = ["it", "maintenance"] as const;

export function getDomainIds(): string[] {
  return [...KNOWN_DOMAINS];
}

export function getDomainConfig(domainId: string): DomainConfig | null {
  if (!domainId || !KNOWN_DOMAINS.includes(domainId as (typeof KNOWN_DOMAINS)[number])) {
    return null;
  }
  try {
    const filePath = path.join(CONFIG_DIR, `domain.${domainId}.json`);
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as DomainConfig;
  } catch {
    return null;
  }
}
