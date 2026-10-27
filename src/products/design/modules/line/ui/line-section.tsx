import type { ElementPatch } from "@canvas";
import type { DesignNode } from "../../core";
import type { LineCap, LineNodeElement } from "../line.types";
import { NodeSelectField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { t } from "../line.i18n";

const CAPS: readonly { value: LineCap; label: string }[] = [
  { value: "none", label: t("section.none") },
  { value: "arrow", label: t("arrow.label") },
];

/** For selected lines: what each end looks like (an arrowhead or nothing). */
export function LineSection({ selection: { nodes } }: PropertySectionProps) {
  const lines = nodes as readonly LineNodeElement[];
  const capField = (which: "startCap" | "endCap", label: string) => (
    <NodeSelectField
      nodes={lines}
      label={label}
      options={CAPS.map((cap) => ({ value: cap.value, label: `${label}: ${cap.label}` }))}
      read={(line) => line[which]}
      patch={(value) => ({ [which]: value }) as ElementPatch<DesignNode>}
    />
  );

  return (
    <PanelSection title={t("label")}>
      <PropertyGrid>
        {capField("startCap", t("section.start"))}
        {capField("endCap", t("section.end"))}
      </PropertyGrid>
    </PanelSection>
  );
}
