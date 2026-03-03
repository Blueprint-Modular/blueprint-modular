/**
 * Identité Blueprint Modular — .blueprintrc et métadonnées d'instance.
 * Souveraineté des données : telemetry toujours false.
 */

import type { BuilderSpec } from "@/lib/ai/builder/spec";
import { APP_VERSION } from "@/lib/version";

export interface BlueprintRC {
  blueprint: "modular";
  version: string;
  generated_by: "maker" | "manual";
  generated_at: string;
  instance_id: string;
  domain: BuilderSpec["domain"];
  entities: string[];
  components: string[];
  modules: string[];
  telemetry: false;
}

export function generateBlueprintRC(spec: BuilderSpec): BlueprintRC {
  return {
    blueprint: "modular",
    version: typeof process !== "undefined" && process.env?.npm_package_version
      ? process.env.npm_package_version
      : APP_VERSION,
    generated_by: "maker",
    generated_at: new Date().toISOString(),
    instance_id: crypto.randomUUID(),
    domain: spec.domain,
    entities: spec.entities.map((e) => e.name),
    components: spec.components,
    modules: spec.modules,
    telemetry: false,
  };
}

/** Retourne le contenu du fichier .blueprintrc (JSON) à inclure à la racine du zip. */
export function getBlueprintRCFileContent(spec: BuilderSpec): string {
  return JSON.stringify(generateBlueprintRC(spec), null, 2);
}
