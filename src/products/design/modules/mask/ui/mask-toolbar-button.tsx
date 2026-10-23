import { SquareDashed } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useSelectedNodes } from "@design/ui/hooks";

/** The toolbar's mask button for the selection: Use as mask, or Remove mask on masks. */
export function MaskToolbarButton() {
  const engine = useDesignEngine();
  const nodes = useSelectedNodes();
  if (nodes.length === 0) return null;
  const masks = nodes.every((node) => node.isMask);
  return (
    <ToolButton
      label={masks ? "Remove mask" : "Use as mask"}
      description={
        masks
          ? "The layers it masks show whole again."
          : nodes.length > 1
            ? "Groups the layers; the bottom one masks the others."
            : "Masks the layers above it."
      }
      shortcut={engine.keymap.label("useAsMask")}
      active={masks}
      onClick={() => engine.commands.useAsMask?.()}
    >
      <SquareDashed />
    </ToolButton>
  );
}
