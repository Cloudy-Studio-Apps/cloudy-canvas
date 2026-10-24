import { useState } from "react";
import { Link2, RectangleHorizontal, RectangleVertical, Unlink2 } from "lucide-react";

import type { ElementPatch, Size } from "@canvas";
import type { DesignNode } from "@design";
import {
  BindSlot,
  NumberField,
  PanelIconButton,
  PanelSection,
  PropertyGrid,
  sharedValue,
} from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";

/** Smallest width or height typed in the panel. */
const MIN_SIDE = 1;

/**
 * Width and height of the selection, optionally keeping proportions, and a button that swaps
 * them (portrait ↔ landscape).
 */
export function LayoutSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const [keepRatio, setKeepRatio] = useState(false);

  /** Gives each resizable node the size `sizeOf` says, keeping its top-left corner. */
  const resizeTo = (sizeOf: (node: DesignNode, keepsRatio: boolean) => Size) =>
    edit(nodes, (node): ElementPatch | null => {
      const kind = engine.kinds.kindOf(node);
      if (!kind.resizable) return null;
      const size = sizeOf(node, keepRatio || kind.keepsRatio);
      return kind.resize(node, { x: node.x, y: node.y, ...size });
    });
  const resize = (side: "w" | "h", value: number) =>
    resizeTo((node, ratio) => sized(node, side, Math.max(MIN_SIDE, Math.round(value)), ratio));
  const swap = () => resizeTo((node) => ({ w: node.h, h: node.w }));
  const square = nodes.every((node) => node.w === node.h);
  const landscape = sharedValue(nodes, (node) => node.w > node.h) ?? true;

  return (
    <PanelSection title="Layout">
      <div className="flex items-center gap-1">
        <PropertyGrid className="flex-1">
          <BindSlot nodes={nodes} path="w">
            <NumberField
              prefix="W"
              label="Width"
              min={MIN_SIDE}
              value={sharedValue(nodes, (node) => node.w)}
              onCommit={(w) => resize("w", w)}
            />
          </BindSlot>
          <BindSlot nodes={nodes} path="h">
            <NumberField
              prefix="H"
              label="Height"
              min={MIN_SIDE}
              value={sharedValue(nodes, (node) => node.h)}
              onCommit={(h) => resize("h", h)}
            />
          </BindSlot>
        </PropertyGrid>
        <PanelIconButton
          label={keepRatio ? "Proportions kept" : "Keep proportions"}
          active={keepRatio}
          onClick={() => setKeepRatio(!keepRatio)}
        >
          {keepRatio ? <Link2 /> : <Unlink2 />}
        </PanelIconButton>
        <PanelIconButton
          label={
            landscape
              ? "Swap width and height (make portrait)"
              : "Swap width and height (make landscape)"
          }
          disabled={square}
          onClick={swap}
        >
          {landscape ? <RectangleVertical /> : <RectangleHorizontal />}
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
