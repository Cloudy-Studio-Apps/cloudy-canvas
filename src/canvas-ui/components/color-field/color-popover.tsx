import { useContext, useEffect, useRef } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import { CHECKERBOARD } from "../color";
import { ColorPicker } from "../color-picker";
import { EngineContext } from "../../engine-context";
import type { ColorPopoverProps } from "./color-field.types";
import { t } from "../components.i18n";

/**
 * A trigger (a swatch by default) that opens the app's color picker. A drag's steps are written
 * live and kept as one undo step of the editor's document (nothing outside an editor), even when
 * the popover closes or goes mid-drag.
 */
export function ColorPopover({
  color,
  opacity,
  label,
  onChange,
  trigger,
  side = "left",
  children,
}: ColorPopoverProps) {
  const engine = useContext(EngineContext);
  const release = useRef<(() => void) | null>(null);
  useEffect(() => () => release.current?.(), []);
  const endDrag = () => {
    release.current?.();
    release.current = null;
  };

  return (
    <Popover onOpenChange={(open) => !open && endDrag()}>
      <PopoverTrigger asChild>
        {trigger ?? (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: a color swatch
          <button
            type="button"
            aria-label={t("color.edit", { label: label.toLowerCase() })}
            title={label}
            className="relative size-3.5 shrink-0 cursor-pointer overflow-hidden rounded-xs border border-border-strong outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: CHECKERBOARD }}
          >
            <span
              className="absolute inset-0"
              style={{ backgroundColor: color, opacity: opacity ?? 1 }}
            />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent side={side} align="start" className="flex w-60 flex-col gap-2 p-3">
        <ColorPicker
          color={color}
          opacity={opacity}
          onChange={(next, info, nextOpacity) => {
            if (!info.done && !release.current)
              release.current = engine?.doc.holdCheckpoints() ?? null;
            onChange({ color: next, opacity: opacity === undefined ? 1 : nextOpacity }, info);
            if (info.done) endDrag();
          }}
        />
        {children}
      </PopoverContent>
    </Popover>
  );
}
