import type { ConnectorHeadItem, ConnectorStyleItem } from "./connector-option-items.types";
import { t } from "../connector.i18n";

export const CONNECTOR_STYLES: ConnectorStyleItem[] = [
  { style: "elbow", label: t("options.elbow") },
  { style: "straight", label: t("options.straight") },
];

/** Arrowhead combinations, shown as small glyphs. */
export const CONNECTOR_HEADS: ConnectorHeadItem[] = [
  { start: "none", end: "arrow", label: t("options.arrowEnd"), glyph: "→" },
  { start: "arrow", end: "arrow", label: t("options.arrowsBoth"), glyph: "↔" },
  { start: "none", end: "none", label: t("options.noArrows"), glyph: "—" },
];
