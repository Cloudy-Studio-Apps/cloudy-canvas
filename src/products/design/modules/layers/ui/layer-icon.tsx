import { Square } from "lucide-react";

import { ExtensionIconView, useEditorModules } from "@canvas-ui";
import { designEditor } from "@design/ui/modules/design-editor-points";
import type { LayerIconProps } from "./layer-icon.types";

/**
 * A layer's icon: its type's `layerIcons` entry, or the icon its type's tool shows on the
 * toolbar (a square for others).
 */
export function LayerIcon({ type }: LayerIconProps) {
  const { host } = useEditorModules();
  const own = host.find(designEditor.layerIcons, type)?.icon;
  const tool = host
    .get(designEditor.tools)
    .find((entry) => "element" in entry && entry.element === type)?.icon;
  const icon = own ?? tool;
  return icon ? <ExtensionIconView icon={icon} /> : <Square />;
}
