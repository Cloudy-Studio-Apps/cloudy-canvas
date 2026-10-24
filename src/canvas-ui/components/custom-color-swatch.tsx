import { useRef } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { useScrubUndo } from "../use-scrub-undo";
import { ColorPicker } from "./color-picker";
import { normalizeHex } from "./normalize-hex";
import { OptionButton } from "./option-button";
import type { CustomColorSwatchProps } from "./custom-color-swatch.types";

/** Hue wheel shown on the custom color swatch (a picker graphic, not a theme color). */
const HUE_WHEEL =
  "conic-gradient(#ff4d4d, #ffb84d, #f5f54d, #4dff88, #4dd2ff, #6b4dff, #ff4dd2, #ff4d4d)";

/**
 * A rainbow swatch that opens the app's color picker (Figma's); it shows the custom color while
 * one is picked. The color applies live while dragging, and a drag is one undo step.
 */
export function CustomColorSwatch({
  color,
  selected,
  onSelect,
  shape = "square",
}: CustomColorSwatchProps) {
  const round = shape === "circle" ? "rounded-full" : "rounded-xs";
  const undo = useScrubUndo();
  const dragging = useRef(false);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <OptionButton selected={selected} aria-label="Custom color" title="Custom color">
          <span
            className={cn(
              "relative flex size-5 items-center justify-center border border-black/10",
              round,
              selected && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
            )}
            style={{ background: HUE_WHEEL }}
          >
            {selected && (
              <span
                className={cn("size-2.5 border border-white", round)}
                style={{ backgroundColor: color }}
              />
            )}
          </span>
        </OptionButton>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-60 p-3">
        <ColorPicker
          color={normalizeHex(color) ?? "#000000"}
          onChange={(next, { done }) => {
            if (!done && !dragging.current) {
              dragging.current = true;
              undo.onScrubStart();
            }
            onSelect(next);
            if (done && dragging.current) {
              dragging.current = false;
              undo.onScrubEnd();
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
