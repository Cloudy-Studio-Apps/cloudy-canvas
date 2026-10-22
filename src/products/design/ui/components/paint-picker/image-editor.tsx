import { ImagePlus } from "lucide-react";

import { CHECKERBOARD } from "@canvas-ui";
import { imagePaint, type ImageScaleMode } from "@design";
import { pickImageFiles } from "@platform";
import { createId } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { cn } from "@shared/ui/lib/utils";
import { useDesignEngine } from "../../design-engine-context";
import { useAssetUrl } from "../../hooks";
import type { ImageEditorProps } from "./paint-picker.types";

const MODES: { id: ImageScaleMode; label: string }[] = [
  { id: "fill", label: "Fill" },
  { id: "fit", label: "Fit" },
];

/** An image paint: its preview, how it covers the shape (Fill, Fit) and choosing the file. */
export function ImageEditor({ paint, onChange }: ImageEditorProps) {
  const engine = useDesignEngine();
  const url = useAssetUrl(paint?.assetId ?? null);

  const choose = async () => {
    try {
      const [file] = await pickImageFiles({ title: "Choose an image", multiple: false });
      if (!file) return;
      const assetId = createId();
      engine.doc.addAsset(assetId, file.data);
      onChange(paint ? { ...paint, assetId } : imagePaint(assetId));
    } catch (error) {
      notifyError("The image couldn't be opened", error);
    }
  };

  return (
    <div className="space-y-3">
      {paint && (
        <Select
          value={paint.scaleMode}
          onValueChange={(value) =>
            onChange({ ...paint, scaleMode: value === "fit" ? "fit" : "fill" })
          }
        >
          <SelectTrigger aria-label="Image scale mode" className="h-7 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODES.map((mode) => (
              <SelectItem key={mode.id} value={mode.id}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div
        className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm border"
        style={{ background: CHECKERBOARD }}
      >
        {url && (
          <img
            src={url}
            alt=""
            className={cn(
              "size-full",
              paint?.scaleMode === "fit" ? "object-contain" : "object-cover",
            )}
          />
        )}
        <Button
          variant={url ? "secondary" : "outline"}
          size="sm"
          onClick={() => void choose()}
          className={cn(
            "absolute",
            url && "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <ImagePlus />
          {url ? "Replace image…" : "Choose image…"}
        </Button>
      </div>
    </div>
  );
}
