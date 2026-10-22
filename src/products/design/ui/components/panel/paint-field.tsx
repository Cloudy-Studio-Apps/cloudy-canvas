import { useEffect, useState } from "react";
import { Eye, EyeOff, Minus } from "lucide-react";

import { isGradientPaint } from "@design";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { PaintPicker } from "../paint-picker";
import { useGradientEditStore } from "../../stores/gradient-edit-store";
import { FieldBox } from "./field-box";
import { HexInput } from "./hex-input";
import { PanelIconButton } from "./panel-section";
import type { PaintFieldProps } from "./paint-field.types";
import { PaintSwatch } from "./paint-swatch";
import { PercentInput } from "./percent-input";

/** What the field shows for a paint that isn't a solid color. */
const PAINT_NAMES = {
  linear: "Linear",
  radial: "Radial",
  angular: "Angular",
  diamond: "Diamond",
  image: "Image",
} as const;

/**
 * One fill or stroke: its swatch (opens the paint picker), its hex (or the kind of paint) and
 * opacity, show/hide and remove. While the picker edits a gradient, its handles show on the canvas.
 */
export function PaintField({
  paint,
  label,
  onChange,
  onRemove,
  allowImage,
  target,
  size,
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

  return (
    <div className={cn("flex items-center gap-1", !paint.visible && "opacity-50")}>
      <FieldBox className="flex-1 gap-0 px-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Edit ${label.toLowerCase()}`}
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
        {paint.type === "solid" ? (
          <HexInput
            color={paint.color}
            label={`${label} hex`}
            className="px-2"
            onCommit={(color) => onChange({ ...paint, color }, done)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 cursor-pointer truncate px-2 text-left text-foreground"
          >
            {PAINT_NAMES[paint.type]}
          </button>
        )}
        <span className="flex h-full w-14 items-center gap-0.5 border-l border-surface px-2">
          <PercentInput
            value={paint.opacity}
            label={`${label} opacity`}
            onCommit={(opacity) => onChange({ ...paint, opacity }, done)}
          />
        </span>
      </FieldBox>
      <PanelIconButton
        label={paint.visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        onClick={() => onChange({ ...paint, visible: !paint.visible }, done)}
      >
        {paint.visible ? <Eye /> : <EyeOff />}
      </PanelIconButton>
      <PanelIconButton label={`Remove ${label.toLowerCase()}`} onClick={onRemove}>
        <Minus />
      </PanelIconButton>
    </div>
  );
}
