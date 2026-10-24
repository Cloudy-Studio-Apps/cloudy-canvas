import { splitTokenColor } from "@canvas";
import { cn } from "@shared/ui/lib/utils";
import type { TokenSwatchProps } from "./tokens.types";

/** A color variable's swatch: its color over a checkerboard, so its alpha shows. */
export function TokenSwatch({ color, round, className }: TokenSwatchProps) {
  const { hex, alpha } = splitTokenColor(color);
  return (
    <span
      className={cn(
        "relative inline-block size-4 shrink-0 overflow-hidden border border-border",
        round ? "rounded-full" : "rounded-xs",
        className,
      )}
      style={{
        backgroundImage:
          "repeating-conic-gradient(var(--color-muted) 0% 25%, var(--color-surface) 0% 50%)",
        backgroundSize: "6px 6px",
      }}
    >
      <span className="absolute inset-0" style={{ backgroundColor: hex, opacity: alpha }} />
    </span>
  );
}
