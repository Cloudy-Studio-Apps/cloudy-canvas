import { X } from "lucide-react";
import { useRef } from "react";

import { cn } from "@shared/ui/lib/utils";
import { VariablesBoard } from "./board/variables-board";
import { UnusedView } from "../usage/unused-view";
import { ExchangeMenu } from "../exchange";
import { VariablesInspector } from "./inspector/variables-inspector";
import { CollectionsSide } from "./side/collections-side";
import { useDragPanel } from "./use-drag-panel";
import { useVariablesWindowStore } from "./variables-window-store";

/**
 * The Variables window over the canvas (dragged by its title bar, resized from its corner): the
 * collections and their groups on the left, the board of cards in the middle, the inspector (or
 * the shade generator) on the right.
 */
export function VariablesWindow() {
  const { open, position, setOpen, showingUnused } = useVariablesWindowStore();
  const panel = useRef<HTMLDivElement>(null);
  const drag = useDragPanel(panel);
  if (!open) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div
        ref={panel}
        role="dialog"
        aria-label="Variables"
        className={cn(
          "pointer-events-auto absolute flex min-h-80 min-w-[640px] resize flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lifted",
          !position && "top-12 left-1/2 -translate-x-1/2",
        )}
        style={{
          width: "min(1180px, calc(100% - 32px))",
          height: "min(720px, calc(100% - 64px))",
          ...(position ? { left: position.left, top: position.top } : {}),
        }}
      >
        <div
          onPointerDown={drag}
          className="flex h-10 shrink-0 cursor-grab items-center gap-1 border-b border-border px-3 select-none active:cursor-grabbing"
        >
          <span className="text-sm font-semibold">Variables</span>
          <div className="ml-auto" />
          <ExchangeMenu />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[168px_minmax(0,1fr)_296px]">
          <CollectionsSide />
          {showingUnused ? <UnusedView /> : <VariablesBoard />}
          <VariablesInspector />
        </div>
      </div>
    </div>
  );
}
