export type FilesSort = "edited" | "name";
export type FilesView = "grid" | "list";

export interface FilesToolbarProps {
  query: string;
  onQuery: (query: string) => void;
  sort: FilesSort;
  onSort: (sort: FilesSort) => void;
  view: FilesView;
  onView: (view: FilesView) => void;
}
