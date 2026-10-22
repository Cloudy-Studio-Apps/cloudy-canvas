import { useState } from "react";
import { Eye, EyeOff, Minus } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { PaintPicker } from "../paint-picker";
import { FieldBox } from "./field-box";
import { HexInput } from "./hex-input";
import { PanelIconButton } from "./panel-section";
import type { PaintFieldProps } from "./paint-field.types";
import { PaintSwatch } from "./paint-swatch";
import { PercentInput } from "./percent-input";

/**
 * One fill or stroke: its swatch (opens the paint picker), its hex (or "Image") and opacity,
 * show/hide and remove.
 */
export function PaintField({ paint, label, onChange, onRemove, allowImage }: PaintFieldProps) {
  const [open, setOpen] = useState(false);
  const done = { done: true };

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
            Image
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
