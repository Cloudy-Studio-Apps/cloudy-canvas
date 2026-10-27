import { Hash } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { POLYGON_DEFAULTS } from "../polygon.defaults";
import type { DesignNode } from "../../core";
import type { PolygonElement } from "../polygon.types";
import { BindableNumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { t } from "../polygon.i18n";

/** For selected polygons: the number of sides. */
export function PolygonSection({ selection: { nodes } }: PropertySectionProps) {
  return (
    <PanelSection title={t("label")}>
      <PropertyGrid>
        <BindableNumberField
          path="pointCount"
          nodes={nodes as readonly PolygonElement[]}
          prefix={<Hash />}
          label={t("sides")}
          min={POLYGON_DEFAULTS.minPoints}
          max={POLYGON_DEFAULTS.maxPoints}
          read={(polygon) => polygon.pointCount}
          patch={(count) => ({ pointCount: Math.round(count) }) as ElementPatch<DesignNode>}
        />
      </PropertyGrid>
    </PanelSection>
  );
}
