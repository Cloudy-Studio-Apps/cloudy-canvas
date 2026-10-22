import { BASE_COMMAND_LABELS } from "@canvas";
import { sortedTools } from "@canvas-ui";
import { boardCanvas } from "@board";
import { boardEditor, getBoardModules, getBoardProduct } from "../../modules";
import type { ShortcutGroup, ShortcutRow } from "./board-shortcut-rows.types";

const TOOL_PREFIX = "tool.";

/** The board's shortcuts in two groups, its tools (in toolbar order) and everything else. */
export function boardShortcutGroups(): ShortcutGroup[] {
  const modules = getBoardModules();
  const { kinds, keybindings } = getBoardProduct();
  const bindingsOf = (command: string) => keybindings[command];

  const tools = sortedTools(modules.get(boardEditor.tools)).flatMap((entry): ShortcutRow[] => {
    const command = `${TOOL_PREFIX}${entry.tool}`;
    const shortcuts = bindingsOf(command);
    const label = "label" in entry ? entry.label : kinds.get(entry.element)?.label;
    const own: ShortcutRow[] = shortcuts && label ? [{ command, label, shortcuts }] : [];
    const subTools = (entry.subTools ?? []).flatMap((sub): ShortcutRow[] => {
      const subCommand = `${TOOL_PREFIX}${sub.id}`;
      const subShortcuts = bindingsOf(subCommand);
      return subShortcuts
        ? [{ command: subCommand, label: sub.label, shortcuts: subShortcuts }]
        : [];
    });
    return [...own, ...subTools];
  });

  const hostCommandLabels = Object.fromEntries(
    modules.get(boardCanvas.hostCommands).map((command) => [command.id, command.label]),
  );
  const editing = Object.entries({ ...BASE_COMMAND_LABELS, ...hostCommandLabels })
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
