import { Bookmark, BookmarkX, X } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { toggleSection } from "../page-actions";
import type { PageRowMenuProps } from "./add-page-menu.types";
import { useAddPageEntries } from "./use-add-page-entries";
import { t } from "../../catalog.i18n";

/**
 * A page's right-click menu: a blank page or a new section after it, a section starting at it
 * (or no longer), and taking it out of the brochure.
 */
export function PageRowMenu({ page, children }: PageRowMenuProps) {
  const { brochure, sections } = useBrochure();
  const position = brochure?.record()?.slots.findIndex((slot) => slot.id === page.slot.id) ?? -1;
  const entries = useAddPageEntries(page.frame, position + 1);
  if (!brochure) return children;
  const starts = sections.some((section) => section.start === page.slot.id);
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
        <ContextMenuItem
          className="gap-2 text-xs"
          onSelect={() => toggleSection(brochure, page.slot.id)}
        >
          {starts ? <BookmarkX className="size-3.5" /> : <Bookmark className="size-3.5" />}
          {starts ? t("tab.add.endSection") : t("section.start")}
        </ContextMenuItem>
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
