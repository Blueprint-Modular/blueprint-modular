/**
 * Version de l'app — source unique : package.json.
 * Utilisé par le footer (AppLayoutClient) et éventuellement d'autres composants.
 */
import packageJson from "../package.json";

const pkg = packageJson as { version: string };
export const APP_VERSION = pkg.version;
