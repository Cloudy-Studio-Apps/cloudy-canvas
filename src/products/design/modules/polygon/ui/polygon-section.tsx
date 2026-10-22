import { Hash } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { POLYGON_DEFAULTS, type PolygonElement } from "@design";
import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";

/** For selected polygons: the number of sides. */
export function PolygonSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();
  const polygons = nodes as readonly PolygonElement[];
  const first = polygons[0]?.pointCount;
  const shared = polygons.every((el) => el.pointCount === first) ? (first ?? null) : null;

  return (
    <PanelSection title="Polygon">
      <PropertyGrid>
        <NumberField
          prefix={<Hash />}
          label="Sides"
          min={POLYGON_DEFAULTS.minPoints}
          max={POLYGON_DEFAULTS.maxPoints}
          value={shared}
          onCommit={(count) =>
            edit(
              polygons,
              () => ({ pointCount: Math.round(count) }) as ElementPatch<PolygonElement>,
            )
          }
        />
      </PropertyGrid>
    </PanelSection>
  );
}
