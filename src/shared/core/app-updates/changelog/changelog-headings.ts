import type { Locale } from "../../i18n/i18n.types";
import type { ChangelogGroupKind, ChangelogHeadings } from "./changelog.types";

/** The kinds of change, in the order a changelog lists them. */
export const CHANGELOG_GROUP_KINDS: readonly ChangelogGroupKind[] = ["new", "improved", "fixed"];

/** `CHANGELOG.md` and `CHANGELOG.es.md` are written with these headings. */
export const CHANGELOG_HEADINGS: Record<Locale, ChangelogHeadings> = {
  en: {
    unreleased: "Unreleased",
    groups: { new: "New", improved: "Improved", fixed: "Fixed" },
  },
  es: {
    unreleased: "Sin publicar",
    groups: { new: "Novedades", improved: "Mejoras", fixed: "Correcciones" },
  },
};
