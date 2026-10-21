import { shortcutLabel } from "@engine";
import { Button } from "@ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@ui/components/ui/dropdown-menu";
import { useEngine, useEngineState } from "../engine/engine-context";

const ZOOM_PRESETS = [0.5, 1, 2];

/** Current zoom percentage; opens zoom-to-fit and preset levels. */
export function ZoomMenu() {
  const engine = useEngine();
  const zoom = useEngineState((state) => state.zoom);
  const percent = `${Math.round(zoom * 100)}%`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-14 justify-center font-mono text-xs tabular-nums"
          aria-label={`Zoom ${percent}`}
        >
          {percent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="min-w-44">
        <DropdownMenuItem onSelect={() => engine.zoomToFit()}>
          Zoom to fit
          <DropdownMenuShortcut>{shortcutLabel("zoomToFit")}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {ZOOM_PRESETS.map((preset) => (
          <DropdownMenuItem key={preset} onSelect={() => engine.zoomTo(preset)}>
            Zoom to {preset * 100}%
            {preset === 1 && (
              <DropdownMenuShortcut>{shortcutLabel("zoomReset")}</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
