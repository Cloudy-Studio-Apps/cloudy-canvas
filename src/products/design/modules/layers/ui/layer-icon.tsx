import { Square } from "lucide-react";

import { ExtensionIconView, useEditorPoint } from "@canvas-ui";
import type { LayerIconProps } from "./layer-icon.types";

/** A layer's icon: the one its type's tool shows on the toolbar (a square for others). */
export function LayerIcon({ type }: LayerIconProps) {
  const tools = useEditorPoint((points) => points.tools);
  const entry = tools.find((tool) => "element" in tool && tool.element === type);
  return entry ? <ExtensionIconView icon={entry.icon} /> : <Square />;
}
