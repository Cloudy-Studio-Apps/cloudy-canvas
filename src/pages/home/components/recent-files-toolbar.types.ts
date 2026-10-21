import type { RecentFilesFilter } from "../filter-recent-files.types";

export interface RecentFilesToolbarProps {
  filter: RecentFilesFilter;
  onChange: (filter: RecentFilesFilter) => void;
}
