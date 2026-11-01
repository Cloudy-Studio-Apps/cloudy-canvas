import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { rowDropLine, useService } from "@canvas-ui";
import { DESIGN_STYLEGUIDE } from "../../model/design-styleguide";
import { groupKey } from "../../sheet/template-choice";
import { Checkbox, cn, IconButton, ListRow } from "@shared/ui/kit";
import { useShowSection } from "../hooks/use-show-section";
import { useStyleguideViewStore } from "../stores/styleguide-view-store";
import { GroupRow } from "./group-row";
import type { CategoryRowProps } from "./tab.types";
import { t } from "../../styleguide.i18n";

/**
 * A category: click shows its section, the chevron lists its groups, the box shows or hides it,
 * and rows drag to reorder (`rowDrag`, owned by the list).
 */
export function CategoryRow({ entry, rowDrag }: CategoryRowProps) {
  const styleguide = useService(DESIGN_STYLEGUIDE);
  const show = useShowSection();
  const [open, setOpen] = useState(false);
  const { drag } = rowDrag;
  const id = entry.category.id;
  const selected = useStyleguideViewStore(
    (state) => state.selected?.category === entry.category.id && !state.selected.group,
  );
  const hiddenKeys = styleguide.settings().hidden;
  const empty = entry.groups.length === 0;
  const count = entry.groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <li
      {...rowDrag.grabProps(id)}
      {...rowDrag.dropProps(id)}
      className={cn(
        "relative",
        rowDropLine(drag?.overId === id ? drag.side : null),
        drag?.id === id && "opacity-50",
      )}
    >
      <ListRow
        icon={
          <IconButton
            size="xs"
            label={open ? t("tab.row.hideGroups") : t("tab.row.showGroups")}
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
        meta={empty ? t("tab.row.empty") : count}
        selected={selected}
        muted={entry.hidden || empty}
        onSelect={() => show(entry.category.id, entry.sheetId)}
        actions={
          <Checkbox
            checked={!entry.hidden}
            aria-label={entry.hidden ? t("tab.row.show") : t("tab.row.hide")}
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
