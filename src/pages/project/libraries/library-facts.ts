import type { LibrarySummary } from "./library-summary.types";
import { t } from "../project.i18n";

/** "12 colors · 6 text styles · Light / Dark": what a library holds, for its card and page. */
export function libraryFacts(library: LibrarySummary): string {
  const parts: string[] = [];
  if (library.colors.length > 0) {
    parts.push(t("libraries.facts.colors", { count: library.colors.length }));
  }
  if (library.textStyles.length > 0) {
    parts.push(t("libraries.facts.text", { count: library.textStyles.length }));
  }
  const assets = library.images.length + library.svgs.length;
  if (assets > 0) parts.push(t("libraries.facts.assets", { count: assets }));
  parts.push(...library.modes);
  return parts.length > 0 ? parts.join(" · ") : t("libraries.facts.empty");
}
