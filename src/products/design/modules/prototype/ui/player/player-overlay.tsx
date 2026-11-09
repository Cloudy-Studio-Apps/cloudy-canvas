import { cn } from "@shared/ui/kit";
import type { PlayerOverlayProps } from "./player-overlay.types";
import { PlayerSurfaceView } from "./player-surface";

/** An open overlay over the device's screen: its backdrop (dimmed when asked) and its screen. */
export function PlayerOverlay({ surface, run, pictures, scale, hints }: PlayerOverlayProps) {
  const entry = surface.overlay;
  return (
    <div
      ref={(el) => (entry && el ? run.attachOverlay(entry, el) : undefined)}
      className="absolute inset-0"
    >
      <div
        data-part="backdrop"
        className={cn("absolute inset-0", entry?.interaction.overlay?.dim && "bg-overlay")}
      />
      <PlayerSurfaceView
        surface={surface}
        pictures={pictures}
        scale={scale}
        hints={hints}
        part="page"
      />
    </div>
  );
}
