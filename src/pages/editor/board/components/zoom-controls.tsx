import { Minus, Plus } from "lucide-react";

import type { CanvasEngine, EngineState } from "@engine";
import { Button } from "@ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@ui/components/ui/dropdown-menu";
import { FloatingPanel } from "./floating-panel";
import { ToolButton } from "./tool-button";

const PRESETS = [0.5, 1, 2];

export function ZoomControls({ engine, state }: { engine: CanvasEngine; state: EngineState }) {
  const percent = `${Math.round(state.zoom * 100)}%`;

  return (
    <FloatingPanel>
      <ToolButton
        label="Zoom out"
        shortcut="Ctrl −"
        onClick={() => engine.zoomOut()}
        className="size-8"
      >
        <Minus />
      </ToolButton>
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
            <DropdownMenuShortcut>Shift 1</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {PRESETS.map((zoom) => (
            <DropdownMenuItem key={zoom} onSelect={() => engine.zoomTo(zoom)}>
              Zoom to {zoom * 100}%
              {zoom === 1 && <DropdownMenuShortcut>Ctrl 0</DropdownMenuShortcut>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolButton
        label="Zoom in"
        shortcut="Ctrl +"
        onClick={() => engine.zoomIn()}
        className="size-8"
      >
        <Plus />
      </ToolButton>
    </FloatingPanel>
  );
}
