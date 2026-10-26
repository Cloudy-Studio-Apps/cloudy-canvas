import { groupKey, DESIGN_STYLEGUIDE } from "@design";
import { useService } from "@canvas-ui";
import { Checkbox, ListRow } from "@shared/ui/kit";
import { useShowSection } from "../hooks/use-show-section";
import { useStyleguideViewStore } from "../stores/styleguide-view-store";
import type { GroupRowProps } from "./tab.types";

/** One group of a category: click shows its section, the box shows or hides it in the view. */
export function GroupRow({ entry, groupId, title, count, hidden }: GroupRowProps) {
  const styleguide = useService(DESIGN_STYLEGUIDE);
  const show = useShowSection();
  const selected = useStyleguideViewStore(
    (state) => state.selected?.category === entry.category.id && state.selected.group === groupId,
  );
  const key = groupKey(entry.category.id, groupId);
  return (
    <ListRow
      depth={1}
      label={title || entry.category.label}
      meta={count}
      selected={selected}
      muted={hidden || entry.hidden}
      onSelect={() => show(entry.category.id, entry.sheetId, groupId)}
      actions={
        <Checkbox
          checked={!hidden}
          aria-label={hidden ? "Show in the view" : "Hide from the view"}
          onCheckedChange={(checked) => styleguide.setHidden(key, !checked)}
          onClick={(event) => event.stopPropagation()}
        />
      }
    />
  );
}
