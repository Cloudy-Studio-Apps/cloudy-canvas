import { LayoutGrid, List } from "lucide-react";

import { SearchInput, SegmentedControl } from "@shared/ui/kit";
import type { AssetFilter, AssetView, AssetsToolbarProps } from "./assets-ui.types";
import { t } from "../assets.i18n";

/** The tab's top: search, grid or list, the "+" menu, and the type filter. */
export function AssetsToolbar({
  query,
  onQuery,
  view,
  onView,
  filter,
  onFilter,
  add,
}: AssetsToolbarProps) {
  return (
    <div className="flex flex-col gap-1.5 border-b p-2">
      <div className="flex items-center gap-1.5">
        <SearchInput
          value={query}
          onChange={onQuery}
          size="sm"
          placeholder={t("search")}
          className="flex-1"
        />
        <SegmentedControl<AssetView>
          label={t("view.label")}
          size="sm"
          iconOnly
          value={view}
          onChange={onView}
          options={[
            { value: "grid", label: t("view.grid"), icon: <LayoutGrid /> },
            { value: "list", label: t("view.list"), icon: <List /> },
          ]}
        />
        {add}
      </div>
      <SegmentedControl<AssetFilter>
        label={t("filter.label")}
        size="sm"
        fullWidth
        value={filter}
        onChange={onFilter}
        options={[
          { value: "all", label: t("filter.all") },
          { value: "image", label: t("filter.image") },
          { value: "svg", label: t("filter.svg") },
          { value: "icon", label: t("filter.icon") },
        ]}
      />
    </div>
  );
}
