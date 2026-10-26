import { useEffect } from "react";

import { imageSize, type ElementPatch } from "@canvas";
import { isNodeKind, toCropPaint, type DesignNode } from "../../core";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useImageCropStore } from "@design/ui/stores/image-crop-store";
import { imageFillIndex } from "./image-fill-index";

/**
 * Runs Crop image: the selected layer's top image fill goes into crop mode, first turned into a
 * crop showing what it showed (one undo step).
 */
export function useCropImageCommand(): void {
  const engine = useDesignEngine();
  useEffect(
    () =>
      engine.handleHostAction("cropImage", () => {
        const [id, ...others] = engine.selectedIds();
        const node = id && others.length === 0 ? engine.getElement(id) : undefined;
        if (!node || !isNodeKind(engine.kinds.kindOf(node))) return;
        const layer = node as DesignNode;
        const index = imageFillIndex(layer);
        const paint = index === null ? undefined : layer.fills[index];
        if (index === null || paint?.type !== "image") return;
        const start = () => useImageCropStore.getState().start({ nodeId: layer.id, index });
        if (paint.scaleMode === "crop") return start();
        const data = engine.doc.getAsset(paint.assetId);
        if (!data) return;
        void imageSize(data).then((size) => {
          const current = engine.getElement(layer.id) as DesignNode | undefined;
          const same = current?.fills[index];
          if (!size || !current || same?.type !== "image" || same.assetId !== paint.assetId) return;
          const image = { w: size.width, h: size.height };
          const cropped = toCropPaint(same, current, image);
          engine.doc.checkpoint();
          const fills = current.fills.map((p, i) => (i === index ? cropped : p));
          engine.doc.update(current.id, { fills } as ElementPatch<DesignNode>);
          start();
        });
      }),
    [engine],
  );
}
