import { useEffect } from "react";

import { cropTransform, transformCrop, type ElementPatch } from "@canvas";
import {
  ImageCropOverlay,
  useAssetUrl,
  useEngineElement,
  useEngineState,
  type ImageCropValue,
} from "@canvas-ui";
import { IMAGE_ACTIONS } from "../image-crop";
import type { ImageElement } from "../image.types";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { useImageCropStore } from "./image-crop-store";

const FULL = { x: 0, y: 0, w: 1, h: 1 };

/**
 * The crop box of the board image being cropped (double-click, or the panel's Crop): its picture
 * moves and scales inside the image and its sides crop it, never past the picture. Enter, Esc or
 * selecting something else ends it.
 */
export function ImageCrop() {
  const engine = useBoardEngine();
  const id = useImageCropStore((state) => state.id);
  const start = useImageCropStore((state) => state.start);
  const stop = useImageCropStore((state) => state.stop);
  const selectedId = useEngineState((state) => state.selectedId);
  const el = useEngineElement(id);
  const image = el?.type === "image" ? (el as ImageElement) : undefined;
  const url = useAssetUrl(image?.assetId ?? null);

  useEffect(
    () =>
      engine.onElementAction(({ elementId, action }) => {
        if (action === IMAGE_ACTIONS.crop) start(elementId);
      }),
    [engine, start],
  );

  useEffect(() => {
    if (id && (!image || selectedId !== id)) stop();
  }, [id, image, selectedId, stop]);

  if (!image) return null;
  const p = image.padding;

  const change = ({ frame, transform }: ImageCropValue, checkpoint: boolean) => {
    const crop = transformCrop(transform);
    if (!crop) return;
    const patch: ElementPatch<ImageElement> = {
      crop,
      x: frame.x - p,
      y: frame.y - p,
      w: frame.w + p * 2,
      h: frame.h + p * 2,
    };
    if (checkpoint) engine.doc.checkpoint();
    engine.doc.update(image.id, patch as ElementPatch);
  };

  return (
    <ImageCropOverlay
      frame={{
        x: image.x + p,
        y: image.y + p,
        w: image.w - p * 2,
        h: image.h - p * 2,
        rotation: 0,
      }}
      transform={cropTransform(image.crop ?? FULL)}
      url={url}
      clamp
      onChange={change}
      onDone={stop}
    />
  );
}
