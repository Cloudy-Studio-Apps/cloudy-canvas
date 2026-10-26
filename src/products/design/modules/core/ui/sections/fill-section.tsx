import { DesignNodeKind } from "../../node/design-node.kind";
import { solidPaint } from "../../node/solid-paint";
import type { PropertySectionProps } from "@design/ui/modules";
import { PaintListSection } from "./paint-list-section";

/** New fills are a light gray, like new rectangles. */
const NEW_FILL = "#D9D9D9";

/** The selection's fills. */
export function FillSection({ selection: { nodes, kinds } }: PropertySectionProps) {
  // Image fills only when every selected node can show one (text can't).
  const allowImage = nodes.every((node) => {
    const kind = kinds.kindOf(node);
    return !(kind instanceof DesignNodeKind) || kind.imageFills;
  });
  return (
    <PaintListSection
      title="Fills"
      field="fills"
      nodes={nodes}
      allowImage={allowImage}
      newPaint={() => solidPaint(NEW_FILL)}
    />
  );
}
