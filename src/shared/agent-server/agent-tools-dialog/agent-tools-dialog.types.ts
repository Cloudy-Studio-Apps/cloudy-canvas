import type { AgentToolInfo, AgentToolSection } from "../agent-tool-catalog.types";

export interface AgentToolsDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export interface AgentToolsListProps {
  sections: readonly AgentToolSection[];
}

export interface AgentToolSectionViewProps {
  section: AgentToolSection;
}

export interface AgentToolRowProps {
  tool: AgentToolInfo;
}
