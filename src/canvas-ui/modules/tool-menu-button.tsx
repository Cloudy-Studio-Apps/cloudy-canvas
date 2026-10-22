import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { cn } from "@shared/ui/lib/utils";
import { ToolButton } from "../components/tool-button";
import { useEngine, useEngineState } from "../engine-context";
import type { ToolMenuButtonProps } from "./editor-points.types";
import { ExtensionIconView } from "./extension-icon-view";
import { toolInfo } from "./tool-entries";

/**
 * A toolbar button for several tools (e.g. the shapes): it shows the active one or the one picked
 * last, and its chevron lists them all with their shortcuts.
 */
export function ToolMenuButton({ entries }: ToolMenuButtonProps) {
  const engine = useEngine();
  const activeTool = useEngineState((state) => state.tool);
  const [last, setLast] = useState(entries[0]?.tool);
  const active = entries.find((entry) => entry.tool === activeTool);
  // A tool picked with its shortcut becomes the one the button shows.
  if (active && active.tool !== last) setLast(active.tool);
  const shown = active ?? entries.find((entry) => entry.tool === last) ?? entries[0];
  if (!shown) return null;
  const { label, description } = toolInfo(shown, engine);

  return (
    <div className="flex items-center">
      <ToolButton
        label={label}
        description={description}
        shortcut={engine.keymap.label(`tool.${shown.tool}`)}
        active={!!active}
        onClick={() => engine.setTool(shown.tool)}
      >
        <ExtensionIconView icon={shown.icon} />
      </ToolButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More tools like ${label.toLowerCase()}`}
            className="flex h-9 w-3.5 cursor-pointer items-center justify-center rounded-sm text-subtle-foreground hover:bg-hover hover:text-foreground data-[state=open]:bg-hover"
          >
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="min-w-48">
          {entries.map((entry) => (
            <DropdownMenuItem
              key={entry.tool}
              onSelect={() => {
                setLast(entry.tool);
                engine.setTool(entry.tool);
              }}
              className={cn(
                entry.tool === activeTool && "bg-primary-soft text-primary-soft-foreground",
              )}
            >
              <ExtensionIconView icon={entry.icon} />
              {toolInfo(entry, engine).label}
              <DropdownMenuShortcut>
                {engine.keymap.label(`tool.${entry.tool}`)}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
