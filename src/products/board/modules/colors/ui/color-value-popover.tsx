import { useRef } from "react";

import { joinTokenColor, resolveVariable, splitTokenColor } from "@canvas";
import {
  ColorPicker,
  CommitTextarea,
  TokenSwatch,
  useDocumentTokens,
  useScrubUndo,
} from "@canvas-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { colorMode } from "./color-mode";
import type { ColorValuePopoverProps } from "./colors-ui.types";

/**
 * A board color's swatch, which opens the color picker on its value in the mode the board shows
 * (an alias picked over becomes a color of its own; a drag is one undo step) and its description
 * (what it's for, as agents and exports read it).
 */
export function ColorValuePopover({ variable }: ColorValuePopoverProps) {
  const { tokens, store } = useDocumentTokens();
  const undo = useScrubUndo();
  const dragging = useRef(false);
  const resolved = resolveVariable(store, variable.id, {});
  const color = resolved?.type === "color" ? resolved.color : "#000000FF";
  const { hex, alpha } = splitTokenColor(color);
  const mode = colorMode(store, variable);
  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the swatch is the trigger */}
        <button
          type="button"
          aria-label={`Edit ${variable.name}`}
          title="Edit color"
          className="shrink-0 rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <TokenSwatch color={color} className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="flex w-60 flex-col gap-2 p-3">
        <ColorPicker
          color={hex}
          opacity={alpha}
          onChange={(next, { done }, opacity) => {
            if (!done && !dragging.current) {
              dragging.current = true;
              undo.onScrubStart();
            }
            tokens.setValue(variable.id, mode, { color: joinTokenColor(next, opacity) });
            if (done && dragging.current) {
              dragging.current = false;
              undo.onScrubEnd();
            }
          }}
        />
        <CommitTextarea
          aria-label={`${variable.name} description`}
          placeholder="What it's for"
          value={variable.description}
          onCommit={(description) => tokens.updateVariable(variable.id, { description })}
          className="min-h-14 resize-none text-xs"
        />
      </PopoverContent>
    </Popover>
  );
}
