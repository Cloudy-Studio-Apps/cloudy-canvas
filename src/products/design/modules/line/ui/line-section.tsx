import type { ElementPatch } from "@canvas";
import type { DesignNode, LineCap, LineNodeElement } from "@design";
import { NodeSelectField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";

const CAPS: readonly { value: LineCap; label: string }[] = [
  { value: "none", label: "None" },
  { value: "arrow", label: "Arrow" },
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
    <PanelSection title="Line">
      <PropertyGrid>
        {capField("startCap", "Start")}
        {capField("endCap", "End")}
      </PropertyGrid>
    </PanelSection>
  );
}
