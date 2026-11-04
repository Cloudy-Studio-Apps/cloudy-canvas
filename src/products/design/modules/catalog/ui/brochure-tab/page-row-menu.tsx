import { Bookmark, BookmarkPlus, BookmarkX, X } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { startSection, removeSection } from "../section-actions";
import { startLevels } from "../../model/sections";
import type { PageRowMenuProps } from "./add-page-menu.types";
import { useAddPageEntries } from "./use-add-page-entries";
import { t } from "../../catalog.i18n";

/**
 * A page's right-click menu: a blank page or a new section after it, a section or a subsection
 * starting at it (`startLevels`), removing the ones that do, and taking it out of the brochure.
 */
export function PageRowMenu({ page, children }: PageRowMenuProps) {
  const { brochure, sections } = useBrochure();
  const position = brochure?.record()?.slots.findIndex((slot) => slot.id === page.slot.id) ?? -1;
  const entries = useAddPageEntries(page.frame, position + 1);
  if (!brochure) return children;
  const slots = brochure.record()?.slots ?? [];
  const levels = startLevels(sections, slots, page.slot.id);
  const starting = sections.filter((section) => section.start === page.slot.id);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {entries.map(({ id, label, icon: Icon, run }) => (
          <ContextMenuItem key={id} className="gap-2 text-xs" onSelect={run}>
            <Icon className="size-3.5" />
            {label}
          </ContextMenuItem>
        ))}
        <ContextMenuSeparator />
        {levels.section !== null && (
          <ContextMenuItem
            className="gap-2 text-xs"
            onSelect={() => startSection(brochure, page.slot.id, levels.section ?? 0)}
          >
            <Bookmark className="size-3.5" />
            {t("section.start")}
          </ContextMenuItem>
        )}
        {levels.subsection !== null && (
          <ContextMenuItem
            className="gap-2 text-xs"
            onSelect={() => startSection(brochure, page.slot.id, levels.subsection ?? 1)}
          >
            <BookmarkPlus className="size-3.5" />
            {t("section.startSub")}
          </ContextMenuItem>
        )}
        {starting.map((section) => (
          <ContextMenuItem
            key={section.id}
            className="gap-2 text-xs"
            onSelect={() => removeSection(brochure, section.id)}
          >
            <BookmarkX className="size-3.5" />
            {t("tab.add.endSection", { name: section.name })}
          </ContextMenuItem>
        ))}
        <ContextMenuSeparator />
        <ContextMenuItem
          className="gap-2 text-xs text-destructive"
          onSelect={() => brochure.removePages([page.slot.id])}
        >
          <X className="size-3.5" />
          {t("tab.page.remove")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
