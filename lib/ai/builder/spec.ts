/**
 * Spec JSON du Builder — structure produite par l'IA à partir d'une description.
 */

export interface BuilderSpec {
  title: string;
  domain: "production" | "finance" | "hr" | "crm" | "stock" | "custom";
  entities: Array<{
    name: string;
    fields: Array<{ name: string; type: string }>;
  }>;
  relations: string[];
  rules: string[];
  components: string[];
  modules: string[];
  api_routes: string[];
  deployment: "docker-compose" | "vercel" | "vps";
  mind_pattern_applied?: string;
  generated_at: string;
}

const DOMAINS: BuilderSpec["domain"][] = [
  "production",
  "finance",
  "hr",
  "crm",
  "stock",
  "custom",
];
const DEPLOYMENTS: BuilderSpec["deployment"][] = [
  "docker-compose",
  "vercel",
  "vps",
];

export function validateSpec(spec: unknown): spec is BuilderSpec {
  if (!spec || typeof spec !== "object") return false;
  const s = spec as Record<string, unknown>;
  if (typeof s.title !== "string" || !s.title.trim()) return false;
  if (!DOMAINS.includes(s.domain as BuilderSpec["domain"])) return false;
  if (!Array.isArray(s.entities)) return false;
  for (const e of s.entities) {
    if (!e || typeof e !== "object") return false;
    if (typeof (e as { name?: unknown }).name !== "string") return false;
    if (!Array.isArray((e as { fields?: unknown }).fields)) return false;
  }
  if (!Array.isArray(s.components) || s.components.length === 0) return false;
  if (!Array.isArray(s.relations)) return false;
  if (!Array.isArray(s.rules)) return false;
  if (!Array.isArray(s.modules)) return false;
  if (!Array.isArray(s.api_routes)) return false;
  if (!DEPLOYMENTS.includes(s.deployment as BuilderSpec["deployment"]))
    return false;
  if (typeof s.generated_at !== "string") return false;
  return true;
}
