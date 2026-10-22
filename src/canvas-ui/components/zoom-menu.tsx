import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine, useEngineState } from "../engine-context";
import { useSnapping } from "../use-snapping";
import type { ZoomMenuProps } from "./zoom-menu.types";

const ZOOM_PRESETS = [0.5, 1, 2];

/**
 * Current zoom percentage; opens zoom-to-fit, preset levels and what snaps (whole units only on
 * canvases with a pixel grid).
 */
export function ZoomMenu({ side = "top" }: ZoomMenuProps) {
  const engine = useEngine();
  const zoom = useEngineState((state) => state.zoom);
  const [snapping, setSnapping] = useSnapping();
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
      <DropdownMenuContent align="end" side={side} className="min-w-44">
        <DropdownMenuItem onSelect={() => engine.zoomToFit()}>
          Zoom to fit
          <DropdownMenuShortcut>{engine.keymap.label("zoomToFit")}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {ZOOM_PRESETS.map((preset) => (
          <DropdownMenuItem key={preset} onSelect={() => engine.zoomTo(preset)}>
            Zoom to {preset * 100}%
            {preset === 1 && (
              <DropdownMenuShortcut>{engine.keymap.label("zoomReset")}</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={snapping.objects}
          onCheckedChange={(objects) => setSnapping({ objects })}
          onSelect={(event) => event.preventDefault()}
        >
          Snap to objects
        </DropdownMenuCheckboxItem>
        {engine.view.grid === "pixels" && (
          <DropdownMenuCheckboxItem
            checked={snapping.pixelGrid}
            onCheckedChange={(pixelGrid) => setSnapping({ pixelGrid })}
            onSelect={(event) => event.preventDefault()}
          >
            Snap to pixel grid
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
