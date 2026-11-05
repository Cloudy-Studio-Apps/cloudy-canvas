import { Bookmark, BookmarkPlus, BookmarkX, Repeat, Trash2, X } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";
import { runRepeat } from "../../../data/ui";
import { deleteSelectedPages } from "../../mode/delete-selected-pages";
import { useBrochure } from "../hooks/use-brochure";
import { showPage } from "../page-actions";
import { startSection, removeSection } from "../section-actions";
import { startLevels } from "../../model/sections";
import type { PageRowMenuProps } from "./add-page-menu.types";
import { useAddPageEntries } from "./use-add-page-entries";
import { t } from "../../catalog.i18n";

/**
 * A page's right-click menu: a blank page or a new section after it, a section or a subsection
 * starting at it (`startLevels`), removing the ones that do, taking it out of the brochure and
 * deleting its frame (`deleteSelectedPages`). "Repeat this page…" (or its settings, when it repeats)
 * shows the page, whose panel sets the repeat, and "Remove repeat" takes it off with its copies. A
 * page a repeat made follows its template: it starts no section and doesn't repeat.
 */
export function PageRowMenu({ page, children }: PageRowMenuProps) {
  const engine = useDesignEngine();
  const { brochure, sections } = useBrochure();
  const position = brochure?.record()?.slots.findIndex((slot) => slot.id === page.slot.id) ?? -1;
  const entries = useAddPageEntries(page.frame, position + 1);
  if (!brochure) return children;
  const slots = brochure.record()?.slots ?? [];
  const copy = !!page.slot.generated;
  const levels = copy
    ? { section: null, subsection: null }
    : startLevels(sections, slots, page.slot.id);
  const { repeat } = page.slot;
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
        {!copy && (
          <ContextMenuItem className="gap-2 text-xs" onSelect={() => showPage(engine, page.frame)}>
            <Repeat className="size-3.5" />
            {repeat ? t("repeat.menuSettings") : t("repeat.menuPage")}
          </ContextMenuItem>
        )}
        {repeat && (
          <ContextMenuItem
            className="gap-2 text-xs"
            onSelect={() => runRepeat(() => brochure.setRepeat({ slot: page.slot.id }, null))}
          >
            <X className="size-3.5" />
            {t("repeat.remove")}
          </ContextMenuItem>
        )}
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
          {t("mode.takeOut")}
        </ContextMenuItem>
        <ContextMenuItem
          className="gap-2 text-xs text-destructive"
          onSelect={() => {
            engine.select([page.frame.id]);
            const kept = deleteSelectedPages(engine);
            if (kept > 0) toast({ title: t("mode.deleteKept", { count: kept }) });
          }}
        >
          <Trash2 className="size-3.5" />
          {t("mode.deletePages")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
