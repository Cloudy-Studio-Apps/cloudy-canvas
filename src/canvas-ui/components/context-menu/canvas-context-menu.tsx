import { useEffect, useState } from "react";

import type { CanvasEngine, ContextMenuRequest } from "@canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import type { ContextMenuEntryGroup } from "../../modules/editor-points.types";
import { useEngine } from "../../engine-context";
import { useOptionalEditorPoint } from "../../modules/editor-modules-context";
import type { OpenContextMenu } from "./canvas-context-menu.types";
import { allowedGroups } from "./context-menu-allowed";
import { ContextMenuGroups } from "./context-menu-groups";
import { CANVAS_MENU, SELECTION_MENU } from "./context-menu-items";
import type { ContextMenuContext, ContextMenuGroup } from "./context-menu-items.types";
import { MENU_FITS_SCREEN } from "./menu-fits-screen";

/**
 * The canvas's right-click menu: the selection's actions on elements, or paste, select all and
 * export on the empty canvas, less what the current mode doesn't run. Opens where the engine reports
 * a right-click; items run commands.
 */
export function CanvasContextMenu() {
  const engine = useEngine();
  const [menu, setMenu] = useState<OpenContextMenu | null>(null);
  const moduleGroups = useOptionalEditorPoint((points) => points.contextMenu);

  useEffect(
    () =>
      engine.onContextMenu((request: ContextMenuRequest) => {
        const { target } = request;
        const groups = allowedGroups(
          [
            ...(target === "selection" ? SELECTION_MENU : CANVAS_MENU),
            ...moduleMenu(moduleGroups.filter((group) => group.menu === target)),
          ],
          engine,
        );
        // A mode may leave nothing to offer.
        setMenu(
          groups.length > 0 ? { at: request.screen, groups, context: menuContext(engine) } : null,
        );
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
        collisionPadding={8}
        className={`min-w-56 ${MENU_FITS_SCREEN}`}
        onCloseAutoFocus={(event) => event.preventDefault()}
        // Keys pressed in the menu aren't canvas shortcuts.
        onKeyDown={(event) => event.stopPropagation()}
      >
        {menu && <ContextMenuGroups groups={menu.groups} context={menu.context} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The modules' groups: unlabelled ones as they are, labelled ones as submenus gathered in one
 * group after them, so the menu stays short.
 */
function moduleMenu(groups: readonly ContextMenuEntryGroup[]): ContextMenuGroup[] {
  const inline = groups.filter((group) => !group.label).map((group) => group.items);
  const categories = groups.flatMap(({ id, label, items }) =>
    label ? [{ id, label, groups: [items] }] : [],
  );
  return categories.length > 0 ? [...inline, categories] : inline;
}

function menuContext(engine: CanvasEngine): ContextMenuContext {
  const selected = engine.selectedIds().map((id) => engine.getElement(id));
  return {
    selectionCount: selected.length,
    selectionLocked: selected.length > 0 && selected.every((el) => el?.locked),
    anyLocked: engine.elements().some((el) => el.locked),
    styleCopied: engine.hasCopiedStyle(),
  };
}
