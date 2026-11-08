export type ProjectTab = "files" | "libraries" | "trash";

export interface ProjectTabsProps {
  value: ProjectTab;
  onChange: (tab: ProjectTab) => void;
}
