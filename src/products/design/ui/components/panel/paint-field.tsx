import { useState, type KeyboardEvent } from "react";
import { Eye, EyeOff, Minus } from "lucide-react";

import { normalizeHex, useCommitField, type CommitField } from "@canvas-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { PaintPicker } from "../paint-picker";
import { PanelIconButton } from "./panel-section";
import type { PaintFieldProps } from "./paint-field.types";
import { PaintSwatch } from "./paint-swatch";

/**
 * One fill or stroke: its swatch (opens the paint picker), its hex (or "Image") and opacity,
 * show/hide and remove.
 */
export function PaintField({ paint, label, onChange, onRemove, allowImage }: PaintFieldProps) {
  const [open, setOpen] = useState(false);
  const hex = useCommitField(
    paint.type === "solid" ? paint.color.replace("#", "").toUpperCase() : "",
    (draft) => {
      const color = normalizeHex(draft);
      if (!color) return "Enter a hex color, like FF8800";
      if (paint.type === "solid") onChange({ ...paint, color }, { done: true });
    },
  );
  const opacity = useCommitField(String(Math.round(paint.opacity * 100)), (draft) => {
    const value = Number(draft.trim());
    if (draft.trim() === "" || !Number.isFinite(value)) return "Enter a percentage";
    onChange({ ...paint, opacity: Math.min(100, Math.max(0, value)) / 100 }, { done: true });
  });

  const keys = (field: CommitField) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
    if (event.key === "Escape") {
      field.revert();
      event.currentTarget.blur();
    }
  };

  return (
    <div className={cn("flex items-center gap-1", !paint.visible && "opacity-50")}>
      <div className="flex h-7 min-w-0 flex-1 items-center rounded-sm border border-transparent bg-muted text-xs focus-within:border-ring focus-within:bg-surface hover:border-border">
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
          <input
            aria-label={`${label} hex`}
            aria-invalid={hex.error ? true : undefined}
            title={hex.error ?? undefined}
            value={hex.draft}
            onChange={(event) => hex.setDraft(event.target.value)}
            onFocus={hex.onFocus}
            onBlur={hex.onBlur}
            onKeyDown={keys(hex)}
            className="min-w-0 flex-1 bg-transparent px-2 font-mono text-foreground uppercase outline-none"
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
        <span className="flex h-full w-14 items-center gap-0.5 border-l border-surface px-2 tabular-nums">
          <input
            aria-label={`${label} opacity`}
            aria-invalid={opacity.error ? true : undefined}
            title={opacity.error ?? undefined}
            inputMode="decimal"
            value={opacity.draft}
            onChange={(event) => opacity.setDraft(event.target.value)}
            onFocus={opacity.onFocus}
            onBlur={opacity.onBlur}
            onKeyDown={keys(opacity)}
            className="w-full min-w-0 bg-transparent text-foreground outline-none"
          />
          <span className="text-subtle-foreground">%</span>
        </span>
      </div>
      <PanelIconButton
        label={paint.visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        onClick={() => onChange({ ...paint, visible: !paint.visible }, { done: true })}
      >
        {paint.visible ? <Eye /> : <EyeOff />}
      </PanelIconButton>
      <PanelIconButton label={`Remove ${label.toLowerCase()}`} onClick={onRemove}>
        <Minus />
      </PanelIconButton>
    </div>
  );
}
