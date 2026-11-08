import { Zap } from "lucide-react";

import type { LayerBadgeProps } from "@design/ui/modules";
import { useEditorMode } from "@canvas-ui";
import { nodeInteractions } from "../model";
import { PROTOTYPE_MODE_ID } from "../prototype.constants";
import { t } from "../prototype.i18n";

/** In the layers panel, while the Prototype mode is on: a layer that has interactions. */
export function InteractionBadge({ node }: LayerBadgeProps) {
  const mode = useEditorMode();
  if (mode.id !== PROTOTYPE_MODE_ID || nodeInteractions(node).length === 0) return null;
  const label = t("badge.interactions");
  return (
    <span
      title={label}
      aria-label={label}
      className="flex shrink-0 text-subtle-foreground [&_svg]:size-3"
    >
      <Zap />
    </span>
  );
}
