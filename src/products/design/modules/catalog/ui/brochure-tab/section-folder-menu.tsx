import { BookmarkPlus, FilePlus, IndentDecrease, IndentIncrease, Pencil, X } from "lucide-react";

import { tCommon } from "@shared/core";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { paperSize } from "../../model/paper-size";
import { useBrochure } from "../hooks/use-brochure";
import { addBlankPage, addSectionPage } from "../page-actions";
import { canShift, removeSection, shiftSection } from "../section-actions";
import type { SectionFolderMenuProps } from "./brochure-page-row.types";
import { t } from "../../catalog.i18n";

/**
 * A section folder's right-click menu: rename it, add a blank page or a subsection at its end,
 * move it a level in or out (with its subsections), or remove it (its pages stay).
 */
export function SectionFolderMenu({ folder, onRename, children }: SectionFolderMenuProps) {
  const engine = useDesignEngine();
  const { brochure, pages } = useBrochure();
  if (!brochure) return children;
  const { section, depth } = folder.placed;
  const lastSlot = folder.slots.at(-1);
  const last = pages.find((page) => page.slot.id === lastSlot)?.frame;
  const at = (brochure.record()?.slots.findIndex((slot) => slot.id === lastSlot) ?? -1) + 1;
  const label = last ? (paperSize(last).name ?? "Page") : "Page";
  const item = "gap-2 text-xs";
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem className={item} onSelect={onRename}>
          <Pencil className="size-3.5" />
          {tCommon("rename")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className={item}
          disabled={!last}
          onSelect={() => last && addBlankPage(engine, last, label, at)}
        >
          <FilePlus className="size-3.5" />
          {t("tab.folder.addPage")}
        </ContextMenuItem>
        <ContextMenuItem
          className={item}
          disabled={!last}
          onSelect={() => last && addSectionPage(engine, last, label, at, depth + 1)}
        >
          <BookmarkPlus className="size-3.5" />
          {t("tab.folder.addSubsection")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className={item}
          disabled={!canShift(brochure, section.id, 1)}
          onSelect={() => shiftSection(brochure, section.id, 1)}
        >
          <IndentIncrease className="size-3.5" />
          {t("tab.folder.indent")}
        </ContextMenuItem>
        <ContextMenuItem
          className={item}
          disabled={!canShift(brochure, section.id, -1)}
          onSelect={() => shiftSection(brochure, section.id, -1)}
        >
          <IndentDecrease className="size-3.5" />
          {t("tab.folder.outdent")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className={`${item} text-destructive`}
          onSelect={() => removeSection(brochure, section.id)}
        >
          <X className="size-3.5" />
          {t("tab.folder.remove")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
