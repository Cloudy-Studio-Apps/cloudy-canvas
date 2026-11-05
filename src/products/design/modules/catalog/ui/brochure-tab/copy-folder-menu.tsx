import { Trash2, X } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";
import { deleteSelectedPages } from "../../mode/delete-selected-pages";
import { useBrochure } from "../hooks/use-brochure";
import type { CopyFolderMenuProps } from "./copy-folder-menu.types";
import { t } from "../../catalog.i18n";

/**
 * A copy section's right-click menu: detach its made pages from the repeat (they stay where they
 * are as normal pages, `removePages`) or delete them (`deleteSelectedPages`); either way its row
 * isn't made again. One undo step each.
 */
export function CopyFolderMenu({ folder, children }: CopyFolderMenuProps) {
  const engine = useDesignEngine();
  const { brochure, pages } = useBrochure();
  if (!brochure || folder.slots.length === 0) return children;
  const item = "gap-2 text-xs text-destructive";
  const remove = () => {
    const slots = new Set(folder.slots);
    engine.select(pages.filter((page) => slots.has(page.slot.id)).map((page) => page.frame.id));
    const kept = deleteSelectedPages(engine);
    if (kept > 0) toast({ title: t("mode.deleteKept", { count: kept }) });
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem className={item} onSelect={() => brochure.removePages(folder.slots)}>
          <X className="size-3.5" />
          {t("repeat.detach")}
        </ContextMenuItem>
        <ContextMenuItem className={item} onSelect={remove}>
          <Trash2 className="size-3.5" />
          {t("repeat.deleteCopy")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
