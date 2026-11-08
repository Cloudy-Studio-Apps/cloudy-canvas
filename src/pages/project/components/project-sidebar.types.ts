import type { ProjectTab } from "./project-tabs.types";

export interface ProjectSidebarProps {
  tab: ProjectTab;
  onTrash: () => void;
}
