import { Button, ShortcutTooltip } from "@shared/ui/kit";
import { ToolButton } from "../components/tool-button";
import { BadgedIcon } from "./badged-icon";
import { ExtensionIconView } from "./extension-icon-view";
import type { ModeToolbarItemProps } from "./mode-toolbar.types";
import { useModeToolbarItem } from "./use-mode-toolbar-item";

/** One button of a mode's toolbar, with an optional count badge; a primary one shows its label. */
export function ModeToolbarItem({ item }: ModeToolbarItemProps) {
  const view = useModeToolbarItem(item);
  if (!view) return null;
  if (view.primary) {
    return (
      <ShortcutTooltip label={view.label} shortcut={view.shortcut} description={view.description}>
        <Button size="sm" className="mx-1" disabled={view.disabled} onClick={view.run}>
          <ExtensionIconView icon={view.icon} />
          {view.label}
        </Button>
      </ShortcutTooltip>
    );
  }
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
