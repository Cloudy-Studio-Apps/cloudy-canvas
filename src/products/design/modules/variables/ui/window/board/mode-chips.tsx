import { Plus } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";

/**
 * Which modes the board draws: all side by side, or one (the board turns dark for a dark one), and
 * "+ Mode" to add one. Hidden pieces stay hidden until a file has modes.
 */
export function ModeChips() {
  const { tokens, axis, modes } = useBoard();
  const { view, setView } = useVariablesWindowStore();
  const chip = (id: string, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setView(id)}
      className={cn(
        "h-6 rounded-sm px-2.5 text-xs text-muted-foreground",
        view === id && "bg-surface font-medium text-foreground shadow-xs",
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="ml-auto flex items-center gap-1">
      {modes.length > 1 && (
        <div className="flex rounded-md bg-muted p-0.5">
          {chip("all", "All")}
          {modes.map((mode) => chip(mode.id, mode.name))}
        </div>
      )}
      <button
        type="button"
        onClick={() => tokens.addMode(axis?.id ?? null)}
        className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Plus className="size-3.5" /> Mode
      </button>
    </div>
  );
}
