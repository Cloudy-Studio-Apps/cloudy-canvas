import { Hash, Percent } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { STAR_DEFAULTS, type StarElement } from "@design";
import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";

/** For selected stars: the number of points and how deep the inner corners go (ratio). */
export function StarSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();
  const stars = nodes as readonly StarElement[];
  const shared = <T,>(read: (el: StarElement) => T): T | null => {
    const first = stars[0];
    return first && stars.every((el) => read(el) === read(first)) ? read(first) : null;
  };
  const patch = (value: Partial<StarElement>) =>
    edit(stars, () => value as ElementPatch<StarElement>);

  return (
    <PanelSection title="Star">
      <PropertyGrid>
        <NumberField
          prefix={<Hash />}
          label="Points"
          min={STAR_DEFAULTS.minPoints}
          max={STAR_DEFAULTS.maxPoints}
          value={shared((el) => el.pointCount)}
          onCommit={(count) => patch({ pointCount: Math.round(count) })}
        />
        <NumberField
          prefix={<Percent />}
          label="Ratio"
          suffix="%"
          min={1}
          max={100}
          value={shared((el) => Math.round(el.innerRadius * 100))}
          onCommit={(percent) => patch({ innerRadius: percent / 100 })}
        />
      </PropertyGrid>
    </PanelSection>
  );
}
