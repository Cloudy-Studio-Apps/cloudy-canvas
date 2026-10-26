import { useEffect } from "react";

import { IDENTITY_TRANSFORM, type ElementPatch } from "@canvas";
import { ImageCropOverlay, useAssetUrl, type ImageCropValue } from "@canvas-ui";
import type { DesignNode, ImagePaint } from "../../core";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes, useSelectedNodes } from "@design/ui/hooks";
import { useImageCropStore } from "@design/ui/stores/image-crop-store";

/**
 * The crop box of the image fill in crop mode (the paint picker's Crop, or Crop image), over its
 * layer: dragging moves and scales the picture or resizes the layer. It ends with Enter or Esc,
 * or when the layer is no longer the only one selected.
 */
export function ImageCrop() {
  const engine = useDesignEngine();
  const target = useImageCropStore((state) => state.target);
  const stop = useImageCropStore((state) => state.stop);
  const nodes = useSelectedNodes();
  const edit = useEditNodes();

  const node = nodes.length === 1 && nodes[0]?.id === target?.nodeId ? nodes[0] : undefined;
  const fill = target && node ? node.fills[target.index] : undefined;
  const paint = fill?.type === "image" && fill.scaleMode === "crop" ? fill : undefined;
  const url = useAssetUrl(paint?.assetId ?? null);

  // Ends when the layer goes or its fill stops being an image (switching the picker's mode away
  // from Crop ends it there); a fill just turned into a crop may still read as before for a moment.
  const gone = !node || fill?.type !== "image";
  useEffect(() => {
    if (target && gone) stop();
  }, [target, gone, stop]);

  if (!target || !node || !paint) return null;
  const kind = engine.kinds.kindOf(node);
  const { index } = target;

  const change = ({ frame, transform }: ImageCropValue, checkpoint: boolean) =>
    edit(
      [node],
      (current) => {
        const resized = frame.w !== current.w || frame.h !== current.h;
        const box = { x: frame.x, y: frame.y, w: frame.w, h: frame.h };
        const fills = current.fills.map((p, i) =>
          i === index && p.type === "image" ? ({ ...p, transform } satisfies ImagePaint) : p,
        );
        return {
          ...(resized ? (kind.resize(current, box) as ElementPatch<DesignNode>) : {}),
          fills,
        };
      },
      { checkpoint },
    );

  return (
    <ImageCropOverlay
      frame={{
        x: node.x,
        y: node.y,
        w: node.w,
        h: node.h,
        rotation: node.rotation ?? 0,
        mirrored: node.mirrored ?? false,
      }}
      transform={paint.transform ?? IDENTITY_TRANSFORM}
      url={url}
      resizable={kind.resizable}
      onChange={change}
      onDone={stop}
    />
  );
}
