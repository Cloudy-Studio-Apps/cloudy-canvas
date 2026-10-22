import { Minus } from "lucide-react";

import { NODE_DEFAULTS } from "@design";
import { NumberField } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { PaintListSection } from "./paint-list-section";
import { sharedValue } from "./shared-value";

/** The selection's strokes and their weight. */
export function StrokeSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();

  return (
    <PaintListSection
      title="Strokes"
      field="strokes"
      nodes={nodes}
      newPaint={() => ({ ...NODE_DEFAULTS.stroke })}
    >
      <NumberField
        prefix={<Minus />}
        label="Stroke weight"
        min={0}
        className="w-1/2"
        value={sharedValue(nodes, (node) => node.strokeWeight)}
        onCommit={(strokeWeight) => edit(nodes, () => ({ strokeWeight }))}
      />
    </PaintListSection>
  );
}
