import { solidPaint } from "@design";
import type { PropertySectionProps } from "@design/ui/modules";
import { PaintListSection } from "./paint-list-section";

/** New fills are a light gray, like new rectangles. */
const NEW_FILL = "#D9D9D9";

/** The selection's fills. */
export function FillSection({ selection: { nodes } }: PropertySectionProps) {
  return (
    <PaintListSection
      title="Fills"
      field="fills"
      nodes={nodes}
      newPaint={() => solidPaint(NEW_FILL)}
    />
  );
}
