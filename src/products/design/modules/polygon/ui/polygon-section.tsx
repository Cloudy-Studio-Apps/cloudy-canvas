import { Hash } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { POLYGON_DEFAULTS, type DesignNode, type PolygonElement } from "@design";
import { NodeNumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";

/** For selected polygons: the number of sides. */
export function PolygonSection({ selection: { nodes } }: PropertySectionProps) {
  return (
    <PanelSection title="Polygon">
      <PropertyGrid>
        <NodeNumberField
          nodes={nodes as readonly PolygonElement[]}
          prefix={<Hash />}
          label="Sides"
          min={POLYGON_DEFAULTS.minPoints}
          max={POLYGON_DEFAULTS.maxPoints}
          read={(polygon) => polygon.pointCount}
          patch={(count) => ({ pointCount: Math.round(count) }) as ElementPatch<DesignNode>}
        />
      </PropertyGrid>
    </PanelSection>
  );
}
