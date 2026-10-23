import { Crop, Square, SquareDashed, Undo2 } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { IMAGE_BACKGROUND_COLOR, IMAGE_DEFAULTS, imageCropPatch, type ImageElement } from "@board";
import { FloatingPanel, OptionButton, PanelDivider, useEngineState } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { useImageCropStore } from "./image-crop-store";

/** Background (transparent or white), padding and crop of the selected images. */
export function ImageOptions() {
  const engine = useBoardEngine();
  const { imageBackground, imagePadding } = useBoardState((state) => state.options);
  const selectedId = useEngineState((state) => state.selectedId);
  const cropId = useImageCropStore((state) => state.id);
  const startCrop = useImageCropStore((state) => state.start);
  const stopCrop = useImageCropStore((state) => state.stop);
  const cropping = cropId !== null && cropId === selectedId;

  const resetCrop = () => {
    const images = engine
      .selectedIds()
      .map((id) => engine.getElement(id))
      .filter((el): el is ImageElement => el?.type === "image" && !!(el as ImageElement).crop);
    if (images.length === 0) return;
    stopCrop();
    engine.doc.checkpoint();
    engine.doc.updateMany(
      new Map(images.map((el) => [el.id, imageCropPatch(el, null) as ElementPatch])),
    );
  };

  return (
    <FloatingPanel role="group" aria-label="Image options" className="gap-1 px-2">
      <OptionButton
        aria-label="Transparent background"
        title="Transparent background"
        selected={imageBackground === "none"}
        onClick={() => engine.setToolOptions({ imageBackground: "none" })}
      >
        <SquareDashed className="size-[18px]" />
      </OptionButton>
      <OptionButton
        aria-label="White background"
        title="White background"
        selected={imageBackground === "white"}
        onClick={() => engine.setToolOptions({ imageBackground: "white" })}
      >
        <Square className="size-[18px]" style={{ fill: IMAGE_BACKGROUND_COLOR }} />
      </OptionButton>
      <PanelDivider />
      {IMAGE_DEFAULTS.paddings.map(({ name, value }) => (
        <OptionButton
          key={value}
          aria-label={`${name} padding`}
          title={`${name} padding`}
          selected={imagePadding === value}
          onClick={() => engine.setToolOptions({ imagePadding: value })}
        >
          <span className="text-xs leading-none tabular-nums">{value}</span>
        </OptionButton>
      ))}
      <PanelDivider />
      {selectedId && (
        <OptionButton
          aria-label={cropping ? "Done cropping" : "Crop"}
          title={cropping ? "Done cropping (Enter)" : "Crop (double-click)"}
          selected={cropping}
          onClick={() => (cropping ? stopCrop() : startCrop(selectedId))}
        >
          <Crop className="size-[18px]" />
        </OptionButton>
      )}
      <OptionButton aria-label="Reset crop" title="Reset crop" selected={false} onClick={resetCrop}>
        <Undo2 className="size-[18px]" />
      </OptionButton>
    </FloatingPanel>
  );
}
