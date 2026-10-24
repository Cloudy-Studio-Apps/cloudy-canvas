import { ExtensionIconView } from "@canvas-ui";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@shared/ui/components/ui/dropdown-menu";
import { useDesignEngine } from "../../design-engine-context";
import { mainMenuLabel } from "./main-menu-label";
import type { MainMenuEntryProps } from "./main-menu.types";

/**
 * One item of the main menu, with its shortcut from the keymap; a checkbox when it has `checked`.
 * A command the current mode doesn't run (`engine.allowsCommand`) is shown disabled.
 */
export function MainMenuEntry({ item, onPick }: MainMenuEntryProps) {
  const engine = useDesignEngine();
  const label = mainMenuLabel(item);
  const disabled = "command" in item && !engine.allowsCommand(item.command);
  const shortcut = "command" in item && (
    <DropdownMenuShortcut>{engine.keymap.label(item.command)}</DropdownMenuShortcut>
  );

  if (item.checked) {
    return (
      <DropdownMenuCheckboxItem
        checked={item.checked(engine)}
        disabled={disabled}
        onSelect={() => onPick(item)}
      >
        {label}
        {shortcut}
      </DropdownMenuCheckboxItem>
    );
  }
  return (
    <DropdownMenuItem disabled={disabled} onSelect={() => onPick(item)}>
      {item.icon ? <ExtensionIconView icon={item.icon} /> : <span className="size-4" />}
      {label}
      {shortcut}
    </DropdownMenuItem>
  );
}
