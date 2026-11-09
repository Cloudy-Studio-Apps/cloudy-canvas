export type ProjectTab = "files" | "libraries" | "content" | "trash";

export interface ProjectTabsProps {
  value: ProjectTab;
  onChange: (tab: ProjectTab) => void;
}
