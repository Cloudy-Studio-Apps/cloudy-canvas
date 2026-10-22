import { NumberField, PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useMoveNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import type { DesignNode } from "../../node";
import { ArrangeButtons } from "./arrange-buttons";
import { RotationRow } from "./rotation-row";
import { sharedValue } from "@design/ui/components/panel";
import { positionOrigin } from "../../tree";

/**
 * Align, distribute and tidy up, X/Y (from the top-left corner of the frame each layer is in, as
 * in Figma; a moved frame takes its children) and the angle of the selection.
 */
export function PositionSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const move = useMoveNodes();
  const origin = (node: DesignNode) =>
    positionOrigin(node, (id) => engine.getElement(id), engine.kinds);

  return (
    <PanelSection title="Position">
      <ArrangeButtons nodes={nodes} />
      <PropertyGrid>
        <NumberField
          prefix="X"
          label="X"
          value={sharedValue(nodes, (node) => node.x - origin(node).x)}
          onCommit={(x) =>
            move(nodes, (node) => ({ dx: Math.round(x + origin(node).x) - node.x, dy: 0 }))
          }
        />
        <NumberField
          prefix="Y"
          label="Y"
          value={sharedValue(nodes, (node) => node.y - origin(node).y)}
          onCommit={(y) =>
            move(nodes, (node) => ({ dx: 0, dy: Math.round(y + origin(node).y) - node.y }))
          }
        />
      </PropertyGrid>
      <RotationRow nodes={nodes} />
    </PanelSection>
  );
}
