import { SquareDashed } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useSelectedNodes } from "@design/ui/hooks";
import { t } from "../mask.i18n";

/** The toolbar's mask button for the selection: Use as mask, or Remove mask on masks. */
export function MaskToolbarButton() {
  const engine = useDesignEngine();
  const nodes = useSelectedNodes();
  if (nodes.length === 0) return null;
  const masks = nodes.every((node) => node.isMask);
  return (
    <ToolButton
      label={masks ? t("commands.remove") : t("commands.use")}
      description={
        masks
          ? t("toolbar.removeHint")
          : nodes.length > 1
            ? t("toolbar.groupsHint")
            : t("toolbar.aboveHint")
      }
      shortcut={engine.keymap.label("useAsMask")}
      active={masks}
      onClick={() => engine.commands.useAsMask?.()}
    >
      <SquareDashed />
    </ToolButton>
  );
}
