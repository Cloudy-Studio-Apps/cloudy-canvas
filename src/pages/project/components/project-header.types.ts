import type { ProjectTab } from "./project-tabs.types";

export interface ProjectHeaderProps {
  tab: ProjectTab;
  onTab: (tab: ProjectTab) => void;
}
