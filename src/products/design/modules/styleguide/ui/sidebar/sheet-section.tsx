import { isSheet } from "@design";
import type { PropertySectionProps } from "@design/ui/modules/design-editor-points.types";
import { SheetFields } from "./sheet-fields";

/**
 * A live design-system element's section in the properties panel: what it shows, its template
 * (its own, or the one configured), modes side by side, and Convert to design.
 */
export function SheetSection({ selection }: PropertySectionProps) {
  const sheet = selection.nodes.find(isSheet);
  if (!sheet) return null;
  return <SheetFields sheet={sheet} count={selection.nodes.length} />;
}
