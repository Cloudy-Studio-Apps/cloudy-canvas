import { PLUGIN_API_VERSION } from "./plugin-api-version";
import type { PluginManifest } from "./plugin.types";
import { isSafeRelativePath } from "./safe-relative-path";

const ID = /^[a-z0-9][a-z0-9-]*$/;

/**
 * The manifest in `plugin.json`'s data, or an error saying what's wrong with it (in words the
 * user can act on).
 */
export function readPluginManifest(data: unknown): PluginManifest | string {
  if (typeof data !== "object" || data === null) return "plugin.json isn't a JSON object.";
  const m = data as Record<string, unknown>;
  if (typeof m.id !== "string" || !ID.test(m.id)) {
    return 'plugin.json needs an "id" of lowercase letters, digits and dashes.';
  }
  for (const field of ["name", "version", "main"] as const) {
    if (typeof m[field] !== "string" || !m[field]) return `plugin.json needs a "${field}".`;
  }
  if (m.apiVersion !== PLUGIN_API_VERSION) {
    return `The plugin is for API version ${String(m.apiVersion)}; this app supports ${PLUGIN_API_VERSION}.`;
  }
  if (!Array.isArray(m.products) || !m.products.every((p) => typeof p === "string")) {
    return 'plugin.json needs "products", e.g. ["board"].';
  }
  if (!isSafeRelativePath(m.main as string)) return '"main" must be a file inside the plugin.';
  for (const field of ["description", "author"] as const) {
    if (m[field] !== undefined && typeof m[field] !== "string") {
      return `"${field}" in plugin.json must be text.`;
    }
  }
  return {
    id: m.id,
    name: m.name as string,
    version: m.version as string,
    apiVersion: m.apiVersion,
    products: m.products as string[],
    main: m.main as string,
    ...(typeof m.description === "string" ? { description: m.description } : {}),
    ...(typeof m.author === "string" ? { author: m.author } : {}),
  };
}
