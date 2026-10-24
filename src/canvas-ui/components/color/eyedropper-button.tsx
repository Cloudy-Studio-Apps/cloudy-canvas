import { Pipette } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { normalizeHex } from "../normalize-hex";
import type { EyeDropperApi, EyedropperButtonProps } from "./color.types";

/** The browser's EyeDropper constructor, when it has one. */
const EyeDropper = (window as unknown as { EyeDropper?: new () => EyeDropperApi }).EyeDropper;

/** Picks a color from anywhere on screen. Not shown where the browser can't (WebKit on Linux). */
export function EyedropperButton({ onPick }: EyedropperButtonProps) {
  if (!EyeDropper) return null;
  return (
    <IconButton
      size="xs"
      label="Pick a color from the screen"
      onClick={() => {
        new EyeDropper()
          .open()
          .then(({ sRGBHex }) => {
            const color = normalizeHex(sRGBHex);
            if (color) onPick(color);
          })
          // Escape cancels the pick; nothing to do.
          .catch(() => undefined);
      }}
    >
      <Pipette />
    </IconButton>
  );
}
