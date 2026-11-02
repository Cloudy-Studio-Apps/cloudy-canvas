import { ToolButton } from "../components/tool-button";
import { BadgedIcon } from "./badged-icon";
import type { ModeToolbarItemProps } from "./mode-toolbar.types";
import { useModeToolbarItem } from "./use-mode-toolbar-item";

/** One button of a mode's toolbar, with an optional count badge. */
export function ModeToolbarItem({ item }: ModeToolbarItemProps) {
  const view = useModeToolbarItem(item);
  if (!view) return null;
  return (
    <ToolButton
      label={view.label}
      description={view.description}
      shortcut={view.shortcut}
      active={view.active}
      disabled={view.disabled}
      onClick={view.run}
    >
      <BadgedIcon icon={view.icon} badge={view.badge} />
    </ToolButton>
  );
}
