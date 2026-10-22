import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine } from "../../engine-context";
import type { ContextMenuSubmenuEntryProps } from "./context-menu-entry.types";

/** An entry of the context menu that opens a submenu of actions (disabled when it has none). */
export function ContextMenuSubmenuEntry({ item, context }: ContextMenuSubmenuEntryProps) {
  const engine = useEngine();
  const actions = item.actions(engine, context);
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={actions.length === 0}>{item.label}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
        {actions.map((action, i) => (
          <DropdownMenuItem key={i} onSelect={() => action.run()}>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
