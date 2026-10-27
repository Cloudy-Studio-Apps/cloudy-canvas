import { ArrowDownUp } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { SearchInput } from "@shared/ui/kit";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { isHomeFileKind } from "../file-kind";
import type { RecentFilesSort } from "../filter-recent-files.types";
import { RecentFilesViewToggle } from "./recent-files-view-toggle";
import type { RecentFilesToolbarProps } from "./recent-files-toolbar.types";
import { t } from "../home.i18n";

const SORT_LABEL: Record<RecentFilesSort, string> = {
  recent: t("recent.sort.recent"),
  edited: t("recent.sort.edited"),
  name: t("recent.sort.name"),
};

function isSort(value: string): value is RecentFilesSort {
  return value in SORT_LABEL;
}

/** Search, kind filter, sort order and grid or list for the Recent files. */
export function RecentFilesToolbar({ filter, onChange }: RecentFilesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        value={filter.query}
        onChange={(query) => onChange({ ...filter, query })}
        placeholder={t("recent.search")}
        aria-label={t("recent.searchLabel")}
        className="w-full sm:w-64"
      />
      <Tabs
        value={filter.type}
        onValueChange={(type) => onChange({ ...filter, type: isHomeFileKind(type) ? type : "all" })}
      >
        <TabsList aria-label={t("recent.fileType")}>
          <TabsTrigger value="all">{t("recent.all")}</TabsTrigger>
          <TabsTrigger value="board">{t("recent.boards")}</TabsTrigger>
          <TabsTrigger value="design">{t("recent.designs")}</TabsTrigger>
          <TabsTrigger value="catalog">{t("recent.catalogs")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="ml-auto">
            <ArrowDownUp />
            {SORT_LABEL[filter.sort]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={filter.sort}
            onValueChange={(sort) => {
              if (isSort(sort)) onChange({ ...filter, sort });
            }}
          >
            {Object.entries(SORT_LABEL).map(([sort, label]) => (
              <DropdownMenuRadioItem key={sort} value={sort}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <RecentFilesViewToggle />
    </div>
  );
}
