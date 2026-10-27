import { useService } from "@canvas-ui";
import { DESIGN_STYLEGUIDE } from "../../model/design-styleguide";
import { EmptyState } from "@shared/ui/kit";
import { useStyleguideOutline } from "../hooks/use-styleguide";
import { useSystemPage } from "../hooks/use-system-page";
import { CategoryRow } from "./category-row";
import { t } from "../../styleguide.i18n";

/**
 * The Design system tab of the left panel (in the Design system mode): its categories in the
 * view's order, then each one's groups, to show, hide and reorder them.
 */
export function StyleguideTab() {
  const styleguide = useService(DESIGN_STYLEGUIDE);
  const outline = useStyleguideOutline();
  const page = useSystemPage();
  if (!page) {
    return (
      <EmptyState
        className="p-4"
        title={t("tab.empty.title")}
        description={t("tab.empty.description")}
      />
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-10 shrink-0 items-center px-3 text-sm font-semibold text-foreground">
        {t("tab.categories")}
      </header>
      <ul
        aria-label={t("tab.ariaLabel")}
        className="flex flex-col gap-px overflow-y-auto px-1.5 pb-1.5"
      >
        {outline.map((entry, i) => (
          <CategoryRow
            key={entry.category.id}
            entry={entry}
            position={i}
            onDropCategory={(id, position) => {
              const ids = outline.map((other) => other.category.id);
              const from = ids.indexOf(id);
              if (from < 0) return;
              ids.splice(from, 1);
              ids.splice(from < position ? position - 1 : position, 0, id);
              styleguide.setOrder(ids);
            }}
          />
        ))}
      </ul>
    </div>
  );
}
