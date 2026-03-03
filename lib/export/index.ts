/**
 * Module d'export d'applications générées (App Builder).
 * Interfaces et types uniquement — implémentation Phase 2.
 */

export type {
  GeneratedApp,
  DBSchema,
  TableDef,
  RelationDef,
  ExportPackage,
} from "./types";

export type { PreviewManager } from "./preview";
export type { AppPackager } from "./packager";

/** Lors du packaging (packageApp), inclure .blueprintrc à la racine du zip via getBlueprintRCFileContent(spec). */
export { getBlueprintRCFileContent } from "@/lib/blueprint-identity";

// TODO Phase 2 : implémenter PreviewManager
// TODO Phase 2 : implémenter AppPackager
