import type { StylePreviewProps } from "../core.points.types";
import { useDocumentTokens } from "@canvas-ui";
import { shownStyle } from "./shown-style";
import { useStyleType } from "./use-style-type";

/** A style's small picture, as its type draws it (a plain square for a type no module knows). */
export function StylePreview({ style }: StylePreviewProps) {
  const { store } = useDocumentTokens();
  const entry = useStyleType(style.styleType);
  if (!entry) return <span className="size-4 shrink-0 rounded-xs border border-border" />;
  return <entry.Preview style={shownStyle(store, style)} />;
}
