import { cn } from "@shared/ui/lib/utils";
import { cssColor } from "../css-color";
import type { SwatchHalvesProps } from "./swatch-halves.types";

/** A color per mode side by side over a checkerboard (faded where a mode uses the first one's). */
export function SwatchHalves({ colors, faded, className }: SwatchHalvesProps) {
  return (
    <div
      className={cn("flex h-13 bg-[length:10px_10px]", className)}
      style={{
        backgroundImage: "repeating-conic-gradient(var(--muted) 0 25%, var(--surface) 0 50%)",
      }}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          className={cn("flex-1 transition-colors", faded?.[i] && "opacity-45")}
          style={{ backgroundColor: cssColor(color) }}
        />
      ))}
    </div>
  );
}
