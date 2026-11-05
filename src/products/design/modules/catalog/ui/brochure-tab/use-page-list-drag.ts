import { useRowDrag } from "@canvas-ui";
import { toast } from "@shared/stores/toast-store";
import { storedPosition } from "../../model/stored-position";
import { useBrochure } from "../hooks/use-brochure";
import { dropId, dropPosition, dropsBackCover, parseDropId } from "./drop-position";
import type { ListDropTarget } from "./drop-position.types";
import type { PageListDrag, PageListDragInput } from "./use-page-list-drag.types";
import { t } from "../../catalog.i18n";

/**
 * Dragging in the page list: a page (every selected one when it's one of them) or a section's
 * folder (all its pages, its subsections' too) onto pages, blank pages, spread headings,
 * folders (last in that section) and the list's end. The drop's place, counted over the rows shown
 * (pending pages too), is moved to the stored pages' (`storedPosition`). A page a repeat made
 * never moves: dropping one is refused with a toast.
 */
export function usePageListDrag({ list, folders }: PageListDragInput): PageListDrag {
  const { brochure, pages, layout, settings } = useBrochure();
  const carriedFor = (id: string): string[] => {
    const target = parseDropId(id);
    if (target?.kind === "section") return [...(folders.get(target.id)?.slots ?? [])];
    return list.draggedFor(id);
  };
  // A folder takes the pages after its last page that isn't moving.
  const resolved = (target: ListDropTarget, moving: readonly string[]) => {
    if (target.kind !== "section") return { target, after: false };
    const slots = folders.get(target.id)?.slots ?? [];
    const slotId = [...slots].reverse().find((slot) => !moving.includes(slot));
    return slotId ? { target: { kind: "page" as const, slotId }, after: true } : null;
  };

  const rowDrag = useRowDrag({
    onDrop: (id, overId, side) => {
      const over = parseDropId(overId);
      if (!over || !brochure) return;
      const dragged = carriedFor(id);
      const copies = new Set(
        pages.filter((page) => page.slot.generated).map((page) => page.slot.id),
      );
      if (dragged.some((slotId) => copies.has(slotId))) {
        toast({ title: t("repeat.generatedMove") });
        return;
      }
      // The back cover dropped on its own blank: it becomes a page, the back cover goes.
      if (dropsBackCover(layout, dragged, over)) {
        brochure.setSettings({ covers: settings.covers === "both" ? "front" : "none" });
        return;
      }
      const drop = resolved(over, dragged);
      if (!drop) return;
      const position = dropPosition(
        layout,
        pages,
        dragged,
        drop.target,
        drop.after ? "after" : side,
      );
      if (position === null) return;
      const slots = brochure.record()?.slots ?? [];
      brochure.moveMany(dragged, storedPosition(slots, pages, dragged, position));
    },
    canDrop: (id, overId) => {
      const dragged = carriedFor(id);
      const over = parseDropId(overId);
      // Not into itself: its own pages, or a folder it carries (its own, a subsection's).
      if (over?.kind === "section") {
        const start = folders.get(over.id)?.placed.section.start;
        return overId !== id && !(start && dragged.includes(start));
      }
      return !dragged.some((slotId) => overId === dropId({ kind: "page", slotId }));
    },
  });

  const carried = new Set(rowDrag.drag ? carriedFor(rowDrag.drag.id) : []);
  const target = rowDrag.drag ? parseDropId(rowDrag.drag.id) : null;
  const folder = target?.kind === "section" ? folders.get(target.id) : undefined;
  const page = pages.find((item) => item.slot.id === rowDrag.drag?.id);
  const ghost = folder
    ? folder.placed.section.name
    : carried.size > 1
      ? t("tab.dragCount", { count: carried.size })
      : (page?.frame.name ?? "");
  return { rowDrag, carried, ghost };
}
