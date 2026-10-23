import { Square, SquareDashed, SquareDashedTopSolid } from "lucide-react";

import { ExtensionIconView, useEditorModules } from "@canvas-ui";
import { designEditor } from "@design/ui/modules/design-editor-points";
import type { LayerIconProps } from "./layer-icon.types";

/**
 * A layer's icon: a mask's (dashed; half solid when inverted), else its type's `layerIcons`
 * entry, or the icon its type's tool shows on the toolbar (a square for others).
 */
export function LayerIcon({ node }: LayerIconProps) {
  const { host } = useEditorModules();
  const { type } = node;
  if (node.isMask) {
    const label = `${node.maskInverted ? "Inverted " : ""}${node.maskType} mask`;
    return (
      <span title={label} aria-label={label} className="flex">
        {node.maskInverted ? <SquareDashedTopSolid /> : <SquareDashed />}
      </span>
    );
  }
  const entry = host.find(designEditor.layerIcons, type);
  const own = entry?.iconOf?.(node) ?? entry?.icon;
  const tool = host
    .get(designEditor.tools)
    .find((entry) => "element" in entry && entry.element === type)?.icon;
  const icon = own ?? tool;
  return icon ? <ExtensionIconView icon={icon} /> : <Square />;
}
