import { LayoutGrid, List } from "lucide-react";

import {
  SearchInput,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/kit";
import type { FilesSort, FilesToolbarProps } from "./files-toolbar.types";
import { t } from "../project.i18n";

/** Search, sort and the grid or list switch above the files. */
export function FilesToolbar({ query, onQuery, sort, onSort, view, onView }: FilesToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <SearchInput
        size="sm"
        value={query}
        onChange={onQuery}
        placeholder={t("files.search")}
        className="w-52"
      />
      <Select value={sort} onValueChange={(value) => onSort(value as FilesSort)}>
        <SelectTrigger className="h-control-sm w-36" aria-label={t("files.sort")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="edited">{t("files.sortEdited")}</SelectItem>
          <SelectItem value="name">{t("files.sortName")}</SelectItem>
        </SelectContent>
      </Select>
      <SegmentedControl
        size="sm"
        iconOnly
        label={t("files.view")}
        value={view}
        onChange={onView}
        options={[
          { value: "grid", label: t("files.viewGrid"), icon: <LayoutGrid /> },
          { value: "list", label: t("files.viewList"), icon: <List /> },
        ]}
      />
    </div>
  );
}
