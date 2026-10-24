import { useContext, useEffect, useRef } from "react";

import { ColorPicker, EngineContext } from "@canvas-ui";
import { Popover, PopoverContent, PopoverTrigger, Swatch } from "@shared/ui/kit";
import type { SwatchInputProps } from "./variables-ui.types";

/**
 * A color swatch opening the app's color picker (the same one paints use). A drag's steps are
 * written live and kept as one undo step.
 */
export function SwatchInput({ color, opacity, label, onChange }: SwatchInputProps) {
  const engine = useContext(EngineContext);
  const release = useRef<(() => void) | null>(null);
  // Closing mid-drag (or unmounting) still ends the undo step.
  useEffect(() => () => release.current?.(), []);
  const css = opacity === undefined || opacity >= 1 ? color : `${color}${alphaHex(opacity)}`;

  return (
    <Popover onOpenChange={(open) => !open && endDrag()}>
      <PopoverTrigger
        aria-label={label}
        title={label}
        className="flex shrink-0 cursor-pointer items-center rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Swatch color={css} size="xs" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-3">
        <ColorPicker
          color={color}
          opacity={opacity}
          onChange={(next, info, nextOpacity) => {
            if (!info.done && !release.current)
              release.current = engine?.doc.holdCheckpoints() ?? null;
            onChange(next, nextOpacity, info);
            if (info.done) endDrag();
          }}
        />
      </PopoverContent>
    </Popover>
  );

  function endDrag() {
    release.current?.();
    release.current = null;
  }
}

/** 0–1 as two hex digits. */
function alphaHex(opacity: number): string {
  return Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, "0");
}
