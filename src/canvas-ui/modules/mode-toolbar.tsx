import { Button } from "@shared/ui/kit";
import { FloatingPanel, PanelDivider } from "../components/floating-panel";
import { ExtensionIconView } from "./extension-icon-view";
import { ModeToolbarItem } from "./mode-toolbar-item";
import type { ModeToolbarProps } from "./mode-toolbar.types";
import { useEditorMode } from "./use-editor-mode";
import { tCommon } from "@shared/core";

/**
 * A mode's toolbar, in place of the main one: its title, its items (tools, commands, actions and
 * dividers, as data) and Done, which leaves the mode unless `onDone` says otherwise.
 */
export function ModeToolbar({ items, title, label, onDone }: ModeToolbarProps) {
  const mode = useEditorMode();
  return (
    <FloatingPanel role="toolbar" aria-label={label ?? title?.label} aria-orientation="horizontal">
      {title && (
        <>
          <span className="flex items-center gap-1.5 px-2 text-sm font-medium">
            <ExtensionIconView icon={title.icon} className="size-4" />
            {title.label}
          </span>
          <PanelDivider />
        </>
      )}
      {items.map((item, index) =>
        item === "divider" ? (
          <PanelDivider key={index} />
        ) : (
          <ModeToolbarItem key={index} item={item} />
        ),
      )}
      <PanelDivider />
      <Button size="sm" className="mx-1" onClick={onDone ?? mode.leave}>
        {tCommon("done")}
      </Button>
    </FloatingPanel>
  );
}
