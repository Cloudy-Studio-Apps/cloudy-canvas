import { Hash, Percent } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { STAR_DEFAULTS } from "../star.defaults";
import type { DesignNode } from "../../core";
import type { StarElement } from "../star.types";
import { BindableNumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { t } from "../star.i18n";

/** For selected stars: the number of points and how deep the inner corners go (ratio). */
export function StarSection({ selection: { nodes } }: PropertySectionProps) {
  const stars = nodes as readonly StarElement[];

  return (
    <PanelSection title={t("label")}>
      <PropertyGrid>
        <BindableNumberField
          path="pointCount"
          nodes={stars}
          prefix={<Hash />}
          label={t("points")}
          min={STAR_DEFAULTS.minPoints}
          max={STAR_DEFAULTS.maxPoints}
          read={(star) => star.pointCount}
          patch={(count) => ({ pointCount: Math.round(count) }) as ElementPatch<DesignNode>}
        />
        <BindableNumberField
          path="innerRadius"
          nodes={stars}
          prefix={<Percent />}
          label={t("ratio")}
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
