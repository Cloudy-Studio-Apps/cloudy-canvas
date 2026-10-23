import { Crop } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useSelectedNodes } from "@design/ui/hooks";
import { useImageCropStore } from "@design/ui/stores/image-crop-store";
import { imageFillIndex } from "./image-fill-index";

/** The toolbar's Crop image button, for one selected layer with an image fill. */
export function CropToolbarButton() {
  const engine = useDesignEngine();
  const nodes = useSelectedNodes();
  const target = useImageCropStore((state) => state.target);
  const stop = useImageCropStore((state) => state.stop);
  const node = nodes.length === 1 ? nodes[0] : undefined;
  if (!node || imageFillIndex(node) === null) return null;
  const cropping = target?.nodeId === node.id;
  return (
    <ToolButton
      label={cropping ? "Done cropping" : "Crop image"}
      description="Move and scale the picture inside the layer, or resize the layer around it."
      shortcut={engine.keymap.label("cropImage")}
      active={cropping}
      onClick={() => (cropping ? stop() : engine.commands.cropImage?.())}
    >
      <Crop />
    </ToolButton>
  );
}
