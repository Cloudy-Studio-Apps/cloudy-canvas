import { Hotspots } from "./hotspots";
import type { PlayerSurfaceViewProps } from "./player-surface.types";
import { useScreenPicture } from "./use-screen-picture";

/** A screen in the device, where its surface puts it: its picture and its hotspots. */
export function PlayerSurfaceView({
  surface,
  pictures,
  scale,
  hints,
  part,
  ref,
}: PlayerSurfaceViewProps) {
  const url = useScreenPicture(pictures, surface.screen, scale);
  const { rect, screen } = surface;
  return (
    <div
      ref={ref}
      data-part={part}
      className="absolute overflow-hidden"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    >
      {url && (
        <img
          src={url}
          alt={screen.name}
          draggable={false}
          className="absolute inset-0 size-full max-w-none select-none"
        />
      )}
      <Hotspots rects={surface.hotspots} shown={hints} />
    </div>
  );
}
