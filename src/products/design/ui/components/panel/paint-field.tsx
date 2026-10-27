import { useEffect, useState } from "react";
import { Eye, EyeOff, Minus } from "lucide-react";

import { isGradientPaint } from "@design";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { PaintPicker } from "../paint-picker";
import { VariableChip } from "@canvas-ui";
import { useFieldBinding, useSelectedNodes } from "../../hooks";
import { BindButton } from "./bind-button";
import { useGradientEditStore } from "../../stores/gradient-edit-store";
import { useImageCropStore } from "../../stores/image-crop-store";
import { FieldBox } from "./field-box";
import { HexInput } from "@canvas-ui";
import { PanelIconButton } from "./panel-section";
import type { PaintFieldProps } from "./paint-field.types";
import { PaintSwatch } from "./paint-swatch";
import { PercentInput } from "@canvas-ui";
import { t } from "../../design-ui.i18n";

/** What the field shows for a paint that isn't a solid color. */
const PAINT_NAMES = {
  linear: t("paintTypes.linear"),
  radial: t("paintTypes.radial"),
  angular: t("paintTypes.angular"),
  diamond: t("paintTypes.diamond"),
  image: t("paintTypes.image"),
} as const;

/**
 * One fill or stroke: its swatch (opens the paint picker), its hex (or the kind of paint) and
 * opacity, show/hide and remove. While the picker edits a gradient, its handles show on the canvas;
 * while it edits a cropped image, its crop box does.
 */
export function PaintField({
  paint,
  label,
  onChange,
  onRemove,
  allowImage,
  target,
  size,
  bindPath,
}: PaintFieldProps) {
  const [open, setOpen] = useState(false);
  const done = { done: true };
  const setEditTarget = useGradientEditStore((state) => state.setTarget);
  const editing = open && isGradientPaint(paint) && target !== undefined;
  const field = target?.field;
  const index = target?.index;
  useEffect(() => {
    if (!editing || field === undefined || index === undefined) return;
    setEditTarget({ field, index });
    return () => setEditTarget(null);
  }, [editing, field, index, setEditTarget]);

  // A crop being edited in the picker shows its crop box on the canvas (one layer selected).
  const nodes = useSelectedNodes();
  const binding = useFieldBinding(nodes, paint.type === "solid" ? (bindPath ?? "") : "");
  const bound =
    binding.bound !== undefined && binding.field !== undefined && binding.field.type !== "style";
  const nodeId = nodes.length === 1 ? nodes[0]?.id : undefined;
  const cropping = open && paint.type === "image" && paint.scaleMode === "crop";
  const startCrop = useImageCropStore((state) => state.start);
  const stopCrop = useImageCropStore((state) => state.stop);
  useEffect(() => {
    if (!cropping || field !== "fills" || index === undefined || !nodeId) return;
    startCrop({ nodeId, index });
    return () => stopCrop();
  }, [cropping, field, index, nodeId, startCrop, stopCrop]);

  return (
    <div className={cn("group/bind flex items-center gap-1", !paint.visible && "opacity-50")}>
      <FieldBox className="flex-1 gap-0 px-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a paint's swatch and name */}
            <button
              type="button"
              aria-label={t("paint.field.edit", { name: label.toLowerCase() })}
              className="ml-2 shrink-0 cursor-pointer"
            >
              <PaintSwatch paint={paint} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" sideOffset={16} className="w-auto p-0">
            <PaintPicker
              paint={paint}
              onChange={onChange}
              onClose={() => setOpen(false)}
              allowImage={allowImage}
              size={size}
            />
          </PopoverContent>
        </Popover>
        {bound && binding.field && binding.field.type !== "style" ? (
          <VariableChip
            variableId={binding.bound ?? null}
            modes={binding.modes}
            type={binding.field.type}
            scopes={binding.field.scopes}
            onPick={(id) => binding.bind(id)}
            onDetach={() => binding.bind(null)}
            className="mx-1 h-6 flex-1 border-0"
          />
        ) : paint.type === "solid" ? (
          <HexInput
            color={paint.color}
            label={t("paint.field.hex", { name: label })}
            className="px-2"
            onCommit={(color) => onChange({ ...paint, color }, done)}
          />
        ) : (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: a paint's swatch and name
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 cursor-pointer truncate px-2 text-left text-foreground"
          >
            {PAINT_NAMES[paint.type]}
          </button>
        )}
        {!bound && (
          <span className="flex h-full w-14 items-center gap-0.5 border-l border-surface px-2">
            <PercentInput
              value={paint.opacity}
              label={t("paint.field.opacity", { name: label })}
              onCommit={(opacity) => onChange({ ...paint, opacity }, done)}
            />
          </span>
        )}
      </FieldBox>
      {!bound && <BindButton binding={binding} />}
      <PanelIconButton
        label={
          paint.visible
            ? t("paint.field.hide", { name: label.toLowerCase() })
            : t("paint.field.show", { name: label.toLowerCase() })
        }
        onClick={() => onChange({ ...paint, visible: !paint.visible }, done)}
      >
        {paint.visible ? <Eye /> : <EyeOff />}
      </PanelIconButton>
      <PanelIconButton
        label={t("paint.field.remove", { name: label.toLowerCase() })}
        onClick={onRemove}
      >
        <Minus />
      </PanelIconButton>
    </div>
  );
}
