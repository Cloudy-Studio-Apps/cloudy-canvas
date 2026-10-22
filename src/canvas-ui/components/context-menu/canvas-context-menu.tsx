import { Fragment, useEffect, useState } from "react";

import type { CanvasEngine, ContextMenuRequest } from "@canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { useEngine } from "../../engine-context";
import { useOptionalEditorPoint } from "../../modules/editor-modules-context";
import type { OpenContextMenu } from "./canvas-context-menu.types";
import { ContextMenuEntry } from "./context-menu-entry";
import { ContextMenuSubmenuEntry } from "./context-menu-submenu-entry";
import { CANVAS_MENU, SELECTION_MENU } from "./context-menu-items";
import type { ContextMenuContext } from "./context-menu-items.types";

/**
 * The canvas's right-click menu: the selection's actions on elements, or paste, select all and
 * export on the empty canvas. Opens where the engine reports a right-click; items run commands.
 */
export function CanvasContextMenu() {
  const engine = useEngine();
  const [menu, setMenu] = useState<OpenContextMenu | null>(null);
  const moduleGroups = useOptionalEditorPoint((points) => points.contextMenu);

  useEffect(
    () =>
      engine.onContextMenu((request: ContextMenuRequest) => {
        const { target } = request;
        setMenu({
          at: request.screen,
          groups: [
            ...(target === "selection" ? SELECTION_MENU : CANVAS_MENU),
            ...moduleGroups.filter((group) => group.menu === target).map((group) => group.items),
          ],
          context: menuContext(engine),
        });
      }),
    [engine, moduleGroups],
  );

  return (
    <DropdownMenu
      open={menu !== null}
      onOpenChange={(open) => !open && setMenu(null)}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-0"
          style={{ left: menu?.at.x ?? 0, top: menu?.at.y ?? 0 }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={2}
        className="min-w-56"
        onCloseAutoFocus={(event) => event.preventDefault()}
        // Keys pressed in the menu aren't canvas shortcuts.
        onKeyDown={(event) => event.stopPropagation()}
      >
        {menu?.groups.map((group, i) => (
          <Fragment key={i}>
            {i > 0 && <DropdownMenuSeparator />}
            {group.map((item) =>
              "actions" in item ? (
                <ContextMenuSubmenuEntry key={item.id} item={item} context={menu.context} />
              ) : (
                <ContextMenuEntry key={item.command} item={item} context={menu.context} />
              ),
            )}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function menuContext(engine: CanvasEngine): ContextMenuContext {
  const selected = engine.selectedIds().map((id) => engine.getElement(id));
  return {
    selectionCount: selected.length,
    selectionLocked: selected.length > 0 && selected.every((el) => el?.locked),
    anyLocked: engine.elements().some((el) => el.locked),
  };
}
