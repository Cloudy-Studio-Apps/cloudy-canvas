import { cn } from "@shared/ui/lib/utils";
import type { MockFrameViewProps } from "./mock-canvas.types";

const HANDLES = ["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"];

/** A top-level frame on the mock canvas: its name above, its content, and selection chrome. */
export function MockFrameView({ frame, selected, onSelect }: MockFrameViewProps) {
  return (
    <div
      className="absolute"
      style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(frame.id);
      }}
    >
      <span
        className={cn(
          "absolute -top-5 left-0 max-w-full truncate text-xs text-muted-foreground",
          selected && "text-primary",
        )}
      >
        {frame.name}
      </span>
      <div
        className="relative size-full overflow-hidden shadow-xs"
        style={{ backgroundColor: frame.fill }}
      >
        {frame.blocks.map((block, i) => (
          <div
            key={i}
            className="absolute rounded-xs"
            style={{
              left: `${block.x * 100}%`,
              top: `${block.y * 100}%`,
              width: `${block.w * 100}%`,
              height: `${block.h * 100}%`,
              backgroundColor: block.color,
            }}
          />
        ))}
      </div>
      {selected && (
        <>
          <div className="pointer-events-none absolute inset-0 outline-[1.5px] outline-primary" />
          {HANDLES.map((place) => (
            <span
              key={place}
              className={cn("absolute size-2 border-[1.5px] border-primary bg-surface", place)}
            />
          ))}
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-xs bg-primary px-1.5 py-px text-xs whitespace-nowrap text-primary-foreground tabular-nums">
            {frame.w * 4} × {frame.h * 4}
          </span>
        </>
      )}
    </div>
  );
}
