import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useMoveNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { ArrangeButtons } from "./arrange-buttons";
import { sharedValue } from "@design/ui/components/panel";

/** Align, distribute and tidy up, and X/Y of the selection (a moved frame takes its children). */
export function PositionSection({ selection: { nodes } }: PropertySectionProps) {
  const move = useMoveNodes();

  return (
    <PanelSection title="Position">
      <ArrangeButtons nodes={nodes} />
      <PropertyGrid>
        <NumberField
          prefix="X"
          label="X"
          value={sharedValue(nodes, (node) => node.x)}
          onCommit={(x) => move(nodes, (node) => ({ dx: Math.round(x) - node.x, dy: 0 }))}
        />
        <NumberField
          prefix="Y"
          label="Y"
          value={sharedValue(nodes, (node) => node.y)}
          onCommit={(y) => move(nodes, (node) => ({ dx: 0, dy: Math.round(y) - node.y }))}
        />
      </PropertyGrid>
    </PanelSection>
  );
}
