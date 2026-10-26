import { useEngine, useEngineState } from "../engine-context";
import { ToolButton } from "../components/tool-button";
import { useOptionalEditorPoint } from "./editor-modules-context";
import { ExtensionIconView } from "./extension-icon-view";
import type { BadgedIconProps, ModeToolbarItemProps } from "./mode-toolbar.types";
import { toolInfo } from "./tool-entries";

/**
 * One button of a mode's toolbar: a tool (active while it's on; label and icon from its tool
 * entry unless given), a host command or a `run` callback, with an optional count badge.
 */
export function ModeToolbarItem({ item }: ModeToolbarItemProps) {
  const engine = useEngine();
  const tool = useEngineState((state) => state.tool);
  const tools = useOptionalEditorPoint((points) => points.tools);

  if ("tool" in item) {
    const entry = tools.find((candidate) => candidate.tool === item.tool);
    const info = entry ? toolInfo(entry, engine) : undefined;
    const label = item.label ?? info?.label;
    const icon = item.icon ?? entry?.icon;
    if (!label || !icon) return null;
    return (
      <ToolButton
        label={label}
        description={item.description ?? info?.description}
        shortcut={engine.keymap.label(`tool.${item.tool}`)}
        active={tool === item.tool}
        onClick={() => engine.setTool(item.tool)}
      >
        <ExtensionIconView icon={icon} />
      </ToolButton>
    );
  }
  if ("command" in item) {
    return (
      <ToolButton
        label={item.label}
        description={item.description}
        shortcut={engine.keymap.label(item.command)}
        active={item.activeWhen !== undefined && tool === item.activeWhen.tool}
        disabled={item.disabled}
        onClick={() => engine.runHostAction(item.command)}
      >
        <BadgedIcon icon={item.icon} badge={item.badge} />
      </ToolButton>
    );
  }
  return (
    <ToolButton
      label={item.label}
      description={item.description}
      active={item.active}
      disabled={item.disabled}
      onClick={item.run}
    >
      <BadgedIcon icon={item.icon} badge={item.badge} />
    </ToolButton>
  );
}

/** An item's icon, with its count over the corner when there is one. */
function BadgedIcon({ icon, badge }: BadgedIconProps) {
  if (!badge) return <ExtensionIconView icon={icon} />;
  return (
    <span className="relative">
      <ExtensionIconView icon={icon} />
      <span className="absolute -top-1.5 -right-2 min-w-3.5 rounded-sm bg-warning px-0.5 text-[9px] leading-3.5 font-semibold text-surface">
        {badge}
      </span>
    </span>
  );
}
