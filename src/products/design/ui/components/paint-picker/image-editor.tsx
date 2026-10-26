import { CircleHelp, RotateCw } from "lucide-react";

import { imageSize, rotateTransform90, type Size } from "@canvas";
import { CHECKERBOARD, ImageChooseButton, ImageQualityNote, useAssetUrl } from "@canvas-ui";
import {
  addPlaceholderPaint,
  DEFAULT_PLACEHOLDER_COLOR,
  DEFAULT_TILE_SCALE,
  imagePaint,
  isPlaceholderPaint,
  nextRotation,
  toCropPaint,
  withBlendMode,
  type ImagePaint,
  type ImageScaleMode,
} from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { SelectField, type SelectOption } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import { useDesignEngine } from "../../design-engine-context";
import { NumberField, PanelIconButton } from "../panel";
import { imagePreviewStyle } from "./image-preview-style";
import type { ImageEditorProps } from "./paint-picker.types";

const MODES: readonly SelectOption<ImageScaleMode>[] = [
  { value: "fill", label: "Fill" },
  { value: "fit", label: "Fit" },
  { value: "crop", label: "Crop" },
  { value: "tile", label: "Tile" },
];

/** A square when the layer's size isn't known (several layers). */
const SQUARE: Size = { w: 100, h: 100 };

/**
 * An image paint: how it covers the shape (Fill, Fit, Crop, whose box shows on the canvas, Tile
 * and its scale), a quarter turn, its preview and choosing the file, or a placeholder (the layer's
 * color with the foca watona and a "?") for a picture to choose later, which the Catalog lists.
 */
export function ImageEditor({
  paint,
  onChange,
  size = SQUARE,
  placeholderColor = DEFAULT_PLACEHOLDER_COLOR,
}: ImageEditorProps) {
  const engine = useDesignEngine();
  const url = useAssetUrl(paint?.assetId ?? null);

  const placeholder = paint !== null && isPlaceholderPaint(paint);

  const addPlaceholder = () => {
    const next = addPlaceholderPaint(engine.doc, placeholderColor, size);
    onChange(paint ? withBlendMode({ ...next, opacity: paint.opacity }, paint.blendMode) : next);
  };

  const pickMode = async (current: ImagePaint, mode: ImageScaleMode) => {
    if (mode !== "crop") {
      const next: ImagePaint = { ...current, scaleMode: mode };
      delete next.transform;
      onChange(next);
      return;
    }
    // A crop starts from what the paint showed.
    const data = engine.doc.getAsset(current.assetId);
    const picture = data ? await imageSize(data) : null;
    const image = picture ? { w: picture.width, h: picture.height } : size;
    onChange(toCropPaint(current, size, image));
  };

  const rotate = (current: ImagePaint) =>
    onChange(
      current.scaleMode === "crop" && current.transform
        ? { ...current, transform: rotateTransform90(current.transform, size) }
        : { ...current, rotation: nextRotation(current.rotation) },
    );

  return (
    <div className="space-y-3">
      {paint && (
        <div className="flex items-center gap-1">
          <SelectField
            label="Image scale mode"
            value={paint.scaleMode}
            options={MODES}
            onChange={(mode) => void pickMode(paint, mode)}
            className="flex-1"
          />
          {paint.scaleMode === "tile" && (
            <NumberField
              prefix=""
              label="Tile scale"
              value={Math.round((paint.scalingFactor ?? DEFAULT_TILE_SCALE) * 100)}
              suffix="%"
              min={1}
              max={1000}
              onCommit={(value) => onChange({ ...paint, scalingFactor: value / 100 })}
              className="w-16"
            />
          )}
          <PanelIconButton label="Rotate 90°" onClick={() => rotate(paint)}>
            <RotateCw />
          </PanelIconButton>
        </div>
      )}
      <div
        className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm border"
        style={{ background: CHECKERBOARD }}
      >
        {url && paint && (
          <div aria-hidden className="absolute inset-0" style={imagePreviewStyle(paint, url)} />
        )}
        <ImageChooseButton
          replace={!!url}
          variant={url ? "secondary" : "outline"}
          size="sm"
          onChoose={(assetId) => onChange(paint ? { ...paint, assetId } : imagePaint(assetId))}
          className={cn(
            "absolute",
            url && "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        />
        {placeholder && (
          <span className="absolute top-1.5 left-1.5 rounded-xs bg-surface px-1.5 py-0.5 text-xs text-muted-foreground shadow-sm">
            Placeholder
          </span>
        )}
      </div>
      {paint && !placeholder && <ImageQualityNote assetId={paint.assetId} />}
      {!placeholder && (
        <Button variant="outline" size="sm" className="w-full" onClick={addPlaceholder}>
          <CircleHelp />
          Add placeholder
        </Button>
      )}
      {paint?.scaleMode === "crop" && (
        <p className="text-xs text-muted-foreground">
          Drag the picture on the canvas to move it, its corners to scale it and the box to crop.
        </p>
      )}
    </div>
  );
}
