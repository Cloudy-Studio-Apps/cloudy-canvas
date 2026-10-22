import { useState } from "react";
import { Link2, Unlink2 } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";
import {
  NumberField,
  PanelIconButton,
  PanelSection,
  PropertyGrid,
} from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { sharedValue } from "./shared-value";

/** Smallest width or height typed in the panel. */
const MIN_SIDE = 1;

/** Width and height of the selection, optionally keeping proportions. */
export function LayoutSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const [keepRatio, setKeepRatio] = useState(false);

  const resize = (side: "w" | "h", value: number) =>
    edit(nodes, (node): ElementPatch | null => {
      const kind = engine.kinds.kindOf(node);
      if (!kind.resizable) return null;
      const ratio = keepRatio || kind.keepsRatio;
      const size = sized(node, side, Math.max(MIN_SIDE, Math.round(value)), ratio);
      return kind.resize(node, { x: node.x, y: node.y, ...size });
    });

  return (
    <PanelSection title="Layout">
      <div className="flex items-center gap-1">
        <PropertyGrid className="flex-1">
          <NumberField
            prefix="W"
            label="Width"
            min={MIN_SIDE}
            value={sharedValue(nodes, (node) => node.w)}
            onCommit={(w) => resize("w", w)}
          />
          <NumberField
            prefix="H"
            label="Height"
            min={MIN_SIDE}
            value={sharedValue(nodes, (node) => node.h)}
            onCommit={(h) => resize("h", h)}
          />
        </PropertyGrid>
        <PanelIconButton
          label={keepRatio ? "Proportions kept" : "Keep proportions"}
          active={keepRatio}
          onClick={() => setKeepRatio(!keepRatio)}
        >
          {keepRatio ? <Link2 /> : <Unlink2 />}
        </PanelIconButton>
      </div>
    </PanelSection>
  );
}

function sized(node: DesignNode, side: "w" | "h", value: number, keepRatio: boolean) {
  if (side === "w") {
    return {
      w: value,
      h: keepRatio ? Math.max(MIN_SIDE, Math.round((node.h * value) / node.w)) : node.h,
    };
  }
  return {
    w: keepRatio ? Math.max(MIN_SIDE, Math.round((node.w * value) / node.h)) : node.w,
    h: value,
  };
}
