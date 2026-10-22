import { Hash, Percent } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { STAR_DEFAULTS, type DesignNode, type StarElement } from "@design";
import { NodeNumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";

/** For selected stars: the number of points and how deep the inner corners go (ratio). */
export function StarSection({ selection: { nodes } }: PropertySectionProps) {
  const stars = nodes as readonly StarElement[];

  return (
    <PanelSection title="Star">
      <PropertyGrid>
        <NodeNumberField
          nodes={stars}
          prefix={<Hash />}
          label="Points"
          min={STAR_DEFAULTS.minPoints}
          max={STAR_DEFAULTS.maxPoints}
          read={(star) => star.pointCount}
          patch={(count) => ({ pointCount: Math.round(count) }) as ElementPatch<DesignNode>}
        />
        <NodeNumberField
          nodes={stars}
          prefix={<Percent />}
          label="Ratio"
          suffix="%"
          min={1}
          max={100}
          read={(star) => Math.round(star.innerRadius * 100)}
          patch={(percent) => ({ innerRadius: percent / 100 }) as ElementPatch<DesignNode>}
        />
      </PropertyGrid>
    </PanelSection>
  );
}
