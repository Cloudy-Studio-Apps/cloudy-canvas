import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useMoveNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import type { DesignNode } from "../../node";
import { ArrangeButtons } from "./arrange-buttons";
import { RotationRow } from "./rotation-row";
import { sharedValue } from "@design/ui/components/panel";
import { layerPosition, positionMove } from "../../tree";
import { t } from "../../core.i18n";

/**
 * Align, distribute and tidy up, X/Y (from the top-left corner of the frame each layer is in, in
 * its mirrored space for a mirrored one, as in Figma; a moved frame takes its children) and the
 * angle of the selection.
 */
export function PositionSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const move = useMoveNodes();
  const get = (id: string) => engine.getElement(id);
  const position = (node: DesignNode) => layerPosition(node, get, engine.kinds);
  const moveTo = (axis: "x" | "y", value: number) =>
    move(nodes, (node) => positionMove(node, axis, value, get, engine.kinds));

  return (
    <PanelSection title={t("sections.position")}>
      <ArrangeButtons nodes={nodes} />
      <PropertyGrid>
        <NumberField
          prefix="X"
          label="X"
          value={sharedValue(nodes, (node) => position(node).x)}
          onCommit={(x) => moveTo("x", x)}
        />
        <NumberField
          prefix="Y"
          label="Y"
          value={sharedValue(nodes, (node) => position(node).y)}
          onCommit={(y) => moveTo("y", y)}
        />
      </PropertyGrid>
      <RotationRow nodes={nodes} />
    </PanelSection>
  );
}
