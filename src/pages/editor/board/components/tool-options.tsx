import {
  MARKER_COLORS,
  MARKER_SIZES,
  STICKY_COLORS,
  type CanvasEngine,
  type EngineState,
} from "@engine";
import { Separator } from "@ui/components/ui/separator";
import { cn } from "@ui/lib/utils";
import { FloatingPanel } from "./floating-panel";

/** Color/size options for the active tool. Swatch colors are document content colors, not theme tokens. */
export function ToolOptions({ engine, state }: { engine: CanvasEngine; state: EngineState }) {
  const { options } = state;

  if (state.tool === "marker") {
    return (
      <FloatingPanel role="group" aria-label="Marker options" className="gap-1 px-2">
        {MARKER_COLORS.map((color) => (
          <Swatch
            key={color.value}
            label={color.name}
            color={color.value}
            selected={options.markerColor === color.value}
            onSelect={() => engine.setToolOptions({ markerColor: color.value })}
            round
          />
        ))}
        <Separator orientation="vertical" className="mx-1 h-6!" />
        {MARKER_SIZES.map((size) => (
          <button
            key={size.value}
            type="button"
            aria-label={`${size.name} stroke`}
            aria-pressed={options.markerSize === size.value}
            onClick={() => engine.setToolOptions({ markerSize: size.value })}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40",
              options.markerSize === size.value && "bg-primary-soft hover:bg-primary-soft",
            )}
          >
            <span
              className="rounded-full"
              style={{
                width: size.value + 2,
                height: size.value + 2,
                backgroundColor: options.markerColor,
              }}
            />
          </button>
        ))}
      </FloatingPanel>
    );
  }

  if (state.tool === "sticky") {
    return (
      <FloatingPanel role="group" aria-label="Sticky note colors" className="gap-1 px-2">
        {STICKY_COLORS.map((color) => (
          <Swatch
            key={color.value}
            label={color.name}
            color={color.value}
            selected={options.stickyColor === color.value}
            onSelect={() => engine.setToolOptions({ stickyColor: color.value })}
          />
        ))}
      </FloatingPanel>
    );
  }

  return null;
}

function Swatch({
  label,
  color,
  selected,
  onSelect,
  round = false,
}: {
  label: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
  round?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      onClick={onSelect}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40",
        selected && "bg-primary-soft hover:bg-primary-soft",
      )}
    >
      <span
        className={cn(
          "size-5 border border-black/10",
          round ? "rounded-full" : "rounded-xs",
          selected && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
        )}
        style={{ backgroundColor: color }}
      />
    </button>
  );
}
