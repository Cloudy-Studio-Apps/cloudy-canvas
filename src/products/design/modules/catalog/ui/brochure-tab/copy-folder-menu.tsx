import { Trash2, X } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";
import { deleteCopySection } from "../../mode/delete-copy-section";
import { deleteSelectedPages } from "../../mode/delete-selected-pages";
import { copyPassPath } from "../../model/repeats/copy-pass-path";
import { useBrochure } from "../hooks/use-brochure";
import type { CopyFolderMenuProps } from "./copy-folder-menu.types";
import { t } from "../../catalog.i18n";

/**
 * A copy section's right-click menu. A copy of its own repeat (`copyPassPath`) is a whole copy:
 * detach it from the repeat (its made pages stay where they are as normal pages,
 * `detachSection`) or delete its pages, those detached before too (`deleteCopySection`); either
 * way its row isn't made again. Another folder inside a copy (a subsection, an inner repeat's
 * template pass) acts on its own pages, one by one: detaching its copies (`removePages`) or
 * deleting its pages (`deleteSelectedPages`). One undo step each.
 */
export function CopyFolderMenu({ folder, children }: CopyFolderMenuProps) {
  const engine = useDesignEngine();
  const { brochure, pages } = useBrochure();
  if (!brochure || folder.slots.length === 0) return children;
  const id = folder.placed.section.id;
  const whole = copyPassPath(brochure.expansion(), id) !== null;
  const slots = new Set(folder.slots);
  const own = pages.filter((page) => slots.has(page.slot.id));
  const detach = () => {
    if (whole) brochure.detachSection(id);
    else
      brochure.removePages(own.filter((page) => page.slot.generated).map((page) => page.slot.id));
  };
  const remove = () => {
    let kept: number;
    if (whole) kept = deleteCopySection(engine, id);
    else {
      engine.select(own.map((page) => page.frame.id));
      kept = deleteSelectedPages(engine);
    }
    if (kept > 0) toast({ title: t("mode.deleteKept", { count: kept }) });
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem className="gap-2 text-xs" onSelect={detach}>
          <X className="size-3.5" />
          {t("repeat.detach")}
        </ContextMenuItem>
        <ContextMenuItem className="gap-2 text-xs text-destructive" onSelect={remove}>
          <Trash2 className="size-3.5" />
          {whole ? t("repeat.deleteCopy") : t("repeat.deletePages")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
