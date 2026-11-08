import { useEngine, useEngineState } from "../engine-context";
import { useOptionalEditorPoint } from "./editor-modules-context";
import type { ModeToolbarEntry, ModeToolbarItemView } from "./mode-toolbar.types";
import { toolInfo } from "./tool-entries";

/**
 * What one item of a mode's toolbar shows and does, however it's drawn: a tool (active while it's
 * on; label and icon from its tool entry unless given), a host command or a `run` callback.
 * `null` for a tool that has neither a label nor an icon.
 */
export function useModeToolbarItem(
  item: Exclude<ModeToolbarEntry, "divider">,
): ModeToolbarItemView | null {
  const engine = useEngine();
  const tool = useEngineState((state) => state.tool);
  const tools = useOptionalEditorPoint((points) => points.tools);

  if ("tool" in item) {
    const entry = tools.find((candidate) => candidate.tool === item.tool);
    const info = entry ? toolInfo(entry, engine) : undefined;
    const label = item.label ?? info?.label;
    const icon = item.icon ?? entry?.icon;
    if (!label || !icon) return null;
    return {
      label,
      description: item.description ?? info?.description,
      shortcut: engine.keymap.label(`tool.${item.tool}`),
      icon,
      badge: undefined,
      active: tool === item.tool,
      disabled: undefined,
      primary: false,
      run: () => engine.setTool(item.tool),
    };
  }
  if ("command" in item) {
    return {
      label: item.label,
      description: item.description,
      shortcut: engine.keymap.label(item.command),
      icon: item.icon,
      badge: item.badge,
      active: item.activeWhen !== undefined && tool === item.activeWhen.tool,
      disabled: item.disabled,
      primary: item.primary ?? false,
      run: () => engine.runHostAction(item.command),
    };
  }
  return {
    label: item.label,
    description: item.description,
    shortcut: undefined,
    icon: item.icon,
    badge: item.badge,
    active: item.active,
    disabled: item.disabled,
    primary: false,
    run: item.run,
  };
}
