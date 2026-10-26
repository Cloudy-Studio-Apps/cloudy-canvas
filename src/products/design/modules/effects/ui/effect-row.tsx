import { useEffect, useState } from "react";
import { Eye, EyeOff, GripVertical, Minus, Sparkles } from "lucide-react";

import { ExtensionIconView } from "@canvas-ui";
import { FieldBox, PanelIconButton } from "@design/ui/components/panel";
import { cn, Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import { useEffectEditStore } from "./effect-edit-store";
import type { EffectRowProps } from "./effects-ui.types";

/**
 * One effect: a grip to drag it in the list, its type (opens its editor), a line of its values,
 * show/hide and remove.
 */
export function EffectRow({
  effect,
  entry,
  onChange,
  onRemove,
  dragging,
  onDragStart,
  onDragOver,
  onDragEnd,
}: EffectRowProps) {
  const [open, setOpen] = useState(false);
  const setEditing = useEffectEditStore((state) => state.setEditing);
  // While its editor is open, the effect's handles show on the canvas.
  useEffect(() => {
    if (!open) return;
    setEditing(effect.id);
    return () => setEditing(null);
  }, [open, effect.id, setEditing]);
  const Editor = entry?.editor;
  const label = entry?.label ?? effect.type;
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        !effect.visible && "opacity-50",
        dragging && "opacity-40",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => event.preventDefault()}
    >
      <span
        draggable
        aria-label={`Drag ${label.toLowerCase()} to reorder`}
        title="Drag to reorder"
        className="flex h-7 w-3 shrink-0 cursor-grab items-center justify-center text-subtle-foreground [&_svg]:size-3"
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragEnd={onDragEnd}
      >
        <GripVertical />
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the effect's FieldBox as the editor's trigger */}
          <button
            type="button"
            disabled={!Editor}
            aria-label={`Edit ${label.toLowerCase()}`}
            className="min-w-0 flex-1 cursor-pointer text-left disabled:cursor-default"
          >
            <FieldBox className={cn("gap-2", open && "border-ring bg-surface")}>
              <span className="text-muted-foreground [&_svg]:size-3.5">
                <ExtensionIconView icon={entry?.icon ?? Sparkles} className="size-3.5" />
              </span>
              <span className="shrink-0 text-foreground">{label}</span>
              <span className="min-w-0 truncate text-subtle-foreground tabular-nums">
                {entry?.summary(effect)}
              </span>
            </FieldBox>
          </button>
        </PopoverTrigger>
        {Editor && (
          <PopoverContent
            side="left"
            align="start"
            sideOffset={16}
            className="w-64 p-3"
            // Dragging its handles on the canvas keeps the editor open.
            onInteractOutside={(event) => {
              const target = event.target as Element | null;
              if (target?.closest("[data-effect-handles]")) event.preventDefault();
            }}
          >
            <h3 className="mb-2.5 text-xs font-semibold text-foreground">{label}</h3>
            <Editor effect={effect} onChange={onChange} />
          </PopoverContent>
        )}
      </Popover>
      <PanelIconButton
        label={effect.visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        onClick={() => onChange({ ...effect, visible: !effect.visible })}
      >
        {effect.visible ? <Eye /> : <EyeOff />}
      </PanelIconButton>
      <PanelIconButton label={`Remove ${label.toLowerCase()}`} onClick={onRemove}>
        <Minus />
      </PanelIconButton>
    </div>
  );
}
