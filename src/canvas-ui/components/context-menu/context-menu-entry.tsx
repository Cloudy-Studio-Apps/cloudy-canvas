import { BASE_COMMAND_LABELS } from "@canvas";
import { DropdownMenuItem, DropdownMenuShortcut } from "@shared/ui/components/ui/dropdown-menu";
import { useEngine } from "../../engine-context";
import type { ContextMenuEntryProps } from "./context-menu-entry.types";

const COMMAND_LABELS: Readonly<Record<string, string>> = BASE_COMMAND_LABELS;

/** One command of the context menu, with its shortcut from the keymap. */
export function ContextMenuEntry({ item, context }: ContextMenuEntryProps) {
  const engine = useEngine();
  const label =
    typeof item.label === "function"
      ? item.label(context)
      : (item.label ?? COMMAND_LABELS[item.command] ?? item.command);
  return (
    <DropdownMenuItem
      disabled={item.enabled ? !item.enabled(context) : false}
      onSelect={() => engine.commands[item.command]?.()}
      className={item.destructive ? "text-destructive" : undefined}
    >
      {label}
      <DropdownMenuShortcut>{engine.keymap.label(item.command)}</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}
