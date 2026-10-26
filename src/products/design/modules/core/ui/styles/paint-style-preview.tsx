import { readPaintStyle } from "../../styles/paint-style";
import type { StylePreviewProps } from "../core.points.types";
import { Swatch } from "@shared/ui/kit";
import { paintCss } from "./paint-css";

/** A color style's picture: its paints stacked in a swatch, the top one last. */
export function PaintStylePreview({ style }: StylePreviewProps) {
  const paints = (readPaintStyle(style.value)?.paints ?? []).filter((paint) => paint.visible);
  const top = paints.at(-1);
  if (!top || top.type === "solid")
    return <Swatch color={top ? paintCss(top) : "transparent"} size="sm" />;
  return (
    <span
      className="size-4 shrink-0 rounded-xs border border-border"
      style={{ background: paints.map(paintCss).reverse().join(", ") }}
    />
  );
}
