import { BASE_COMMAND_LABELS } from "@canvas";
import { BOARD_HOST_COMMAND_LABELS, BOARD_KEYBINDINGS, boardKinds } from "@board";
import { BOARD_TOOL_GROUPS } from "../../board-tools";
import type { ShortcutGroup, ShortcutRow } from "./board-shortcut-rows.types";

const TOOL_PREFIX = "tool.";

/** The board's shortcuts in two groups, its tools (in toolbar order) and everything else. */
export function boardShortcutGroups(): ShortcutGroup[] {
  const tools = BOARD_TOOL_GROUPS.flat().flatMap((item): ShortcutRow[] => {
    const command = `${TOOL_PREFIX}${item.id}`;
    const shortcuts = bindingsOf(command);
    const label = "label" in item ? item.label : boardKinds.get(item.element)?.label;
    const own: ShortcutRow[] = shortcuts && label ? [{ command, label, shortcuts }] : [];
    const subTools = (item.subTools ?? []).flatMap((sub): ShortcutRow[] => {
      const subCommand = `${TOOL_PREFIX}${sub.id}`;
      const subShortcuts = bindingsOf(subCommand);
      return subShortcuts
        ? [{ command: subCommand, label: sub.label, shortcuts: subShortcuts }]
        : [];
    });
    return [...own, ...subTools];
  });

  const editing = Object.entries({ ...BASE_COMMAND_LABELS, ...BOARD_HOST_COMMAND_LABELS })
    .filter(([command]) => !command.startsWith(TOOL_PREFIX))
    .flatMap(([command, label]): ShortcutRow[] => {
      const shortcuts = bindingsOf(command);
      return shortcuts ? [{ command, label, shortcuts }] : [];
    });

  return [
    { title: "Tools", rows: tools },
    { title: "Editing & view", rows: editing },
  ];
}

function bindingsOf(command: string) {
  return (BOARD_KEYBINDINGS as Record<string, ShortcutRow["shortcuts"] | undefined>)[command];
}
