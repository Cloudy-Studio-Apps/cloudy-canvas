import { ExtensionIconView } from "@canvas-ui";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@shared/ui/components/ui/dropdown-menu";
import { useDesignEngine } from "../../design-engine-context";
import { mainMenuLabel } from "./main-menu-label";
import type { MainMenuEntryProps } from "./main-menu.types";

/** One item of the main menu, with its shortcut from the keymap; a checkbox when it has `checked`. */
export function MainMenuEntry({ item, onPick }: MainMenuEntryProps) {
  const engine = useDesignEngine();
  const label = mainMenuLabel(item);
  const shortcut = "command" in item && (
    <DropdownMenuShortcut>{engine.keymap.label(item.command)}</DropdownMenuShortcut>
  );

  if (item.checked) {
    return (
      <DropdownMenuCheckboxItem checked={item.checked(engine)} onSelect={() => onPick(item)}>
        {label}
        {shortcut}
      </DropdownMenuCheckboxItem>
    );
  }
  return (
    <DropdownMenuItem onSelect={() => onPick(item)}>
      {item.icon ? <ExtensionIconView icon={item.icon} /> : <span className="size-4" />}
      {label}
      {shortcut}
    </DropdownMenuItem>
  );
}
