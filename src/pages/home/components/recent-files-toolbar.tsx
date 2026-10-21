import { ArrowDownUp, Search } from "lucide-react";

import { isFileType } from "@shared/core";
import { Button } from "@shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { Input } from "@shared/ui/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import type { RecentFilesSort } from "../filter-recent-files.types";
import type { RecentFilesToolbarProps } from "./recent-files-toolbar.types";

const SORT_LABEL: Record<RecentFilesSort, string> = {
  recent: "Recently opened",
  edited: "Last edited",
  name: "Name",
};

function isSort(value: string): value is RecentFilesSort {
  return value in SORT_LABEL;
}

/** Search, type filter and sort order for the Recent files grid. */
export function RecentFilesToolbar({ filter, onChange }: RecentFilesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle-foreground" />
        <Input
          type="search"
          value={filter.query}
          onChange={(event) => onChange({ ...filter, query: event.target.value })}
          placeholder="Search files"
          aria-label="Search recent files"
          className="pl-8"
        />
      </div>
      <Tabs
        value={filter.type}
        onValueChange={(type) => onChange({ ...filter, type: isFileType(type) ? type : "all" })}
      >
        <TabsList aria-label="File type">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="board">Boards</TabsTrigger>
          <TabsTrigger value="design">Designs</TabsTrigger>
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
    </div>
  );
}
