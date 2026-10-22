import { Minus } from "lucide-react";

import { NODE_DEFAULTS } from "@design";
import { NodeNumberField } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { PaintListSection } from "./paint-list-section";

/** The selection's strokes and their weight. */
export function StrokeSection({ selection: { nodes } }: PropertySectionProps) {
  return (
    <PaintListSection
      title="Strokes"
      field="strokes"
      nodes={nodes}
      allowImage={false}
      newPaint={() => ({ ...NODE_DEFAULTS.stroke })}
    >
      <NodeNumberField
        nodes={nodes}
        prefix={<Minus />}
        label="Stroke weight"
        min={0}
        className="w-1/2"
        read={(node) => node.strokeWeight}
        patch={(strokeWeight) => ({ strokeWeight })}
      />
    </PaintListSection>
  );
}
