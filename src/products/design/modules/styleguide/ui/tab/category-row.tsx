import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_STYLEGUIDE, groupKey } from "@design";
import { Checkbox, IconButton, ListRow } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import { useShowSection } from "../hooks/use-show-section";
import { useStyleguideViewStore } from "../stores/styleguide-view-store";
import { GroupRow } from "./group-row";
import type { CategoryRowProps } from "./tab.types";

/** The drag data type of a category row. */
const CATEGORY_DRAG = "application/x-cloudy-styleguide-category";

/**
 * A category: click shows its section, the chevron lists its groups, the box shows or hides it,
 * and rows drag to reorder (the upper half of a row drops before it, the lower half after it).
 */
export function CategoryRow({ entry, position, onDropCategory }: CategoryRowProps) {
  const styleguide = useService(DESIGN_STYLEGUIDE);
  const show = useShowSection();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<"before" | "after" | null>(null);
  const selected = useStyleguideViewStore(
    (state) => state.selected?.category === entry.category.id && !state.selected.group,
  );
  const hiddenKeys = styleguide.settings().hidden;
  const empty = entry.groups.length === 0;
  const count = entry.groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <li
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(CATEGORY_DRAG, entry.category.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes(CATEGORY_DRAG)) return;
        event.preventDefault();
        const box = event.currentTarget.getBoundingClientRect();
        setDrop(event.clientY < box.top + box.height / 2 ? "before" : "after");
      }}
      onDragLeave={() => setDrop(null)}
      onDrop={(event) => {
        const id = event.dataTransfer.getData(CATEGORY_DRAG);
        setDrop(null);
        if (!id) return;
        event.preventDefault();
        onDropCategory(id, drop === "after" ? position + 1 : position);
      }}
      className={cn(
        "relative",
        drop === "before" &&
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-primary",
        drop === "after" &&
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-primary",
      )}
    >
      <ListRow
        icon={
          <IconButton
            size="xs"
            label={open ? "Hide its groups" : "Show its groups"}
            tooltip={false}
            disabled={empty || entry.groups.length < 2}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(!open);
            }}
          >
            <ChevronRight className={cn("size-3 transition-transform", open && "rotate-90")} />
          </IconButton>
        }
        label={entry.category.label}
        meta={empty ? "Empty" : count}
        selected={selected}
        muted={entry.hidden || empty}
        onSelect={() => show(entry.category.id, entry.sheetId)}
        actions={
          <Checkbox
            checked={!entry.hidden}
            aria-label={entry.hidden ? "Show in the view" : "Hide from the view"}
            onCheckedChange={(checked) => styleguide.setHidden(entry.category.id, !checked)}
            onClick={(event) => event.stopPropagation()}
          />
        }
      />
      {open && entry.groups.length > 1 && (
        <ul className="flex flex-col gap-px">
          {entry.groups.map((group) => (
            <li key={group.id}>
              <GroupRow
                entry={entry}
                groupId={group.id}
                title={group.title}
                count={group.items.length}
                hidden={hiddenKeys.includes(groupKey(entry.category.id, group.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
