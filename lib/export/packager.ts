/**
 * Interface du packager d'applications pour déploiement autonome (Phase 2).
 * Pas d'implémentation — uniquement le contrat.
 *
 * Lors de l'implémentation de packageApp : inclure à la racine du zip le fichier
 * .blueprintrc avec le contenu de getBlueprintRCFileContent(spec) (voir lib/blueprint-identity).
 */

import type { GeneratedApp, ExportPackage } from "./types";

export interface AppPackager {
  /** Génère le contenu docker-compose.yml. */
  generateDockerCompose(app: GeneratedApp): string;
  /** Génère le template .env. */
  generateEnvTemplate(app: GeneratedApp): string;
  /** Génère le script de déploiement. */
  generateDeployScript(app: GeneratedApp): string;
  /** Produit le package (tar.gz) et ses métadonnées. Inclure .blueprintrc à la racine. */
  packageApp(app: GeneratedApp): Promise<ExportPackage>;
  /** Génère le README du package. */
  generateReadme(app: GeneratedApp): string;
}

// TODO Phase 2 : implémenter AppPackager
