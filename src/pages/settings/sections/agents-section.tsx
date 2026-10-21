import { AgentServerPanel } from "@shared/agent-server";
import { SettingsSection } from "../components/settings-section";

export function AgentsSection() {
  return (
    <SettingsSection
      id="agents"
      title="Agents (MCP)"
      description="Let AI agents like Claude Code read and edit the open board. Only apps on this computer can connect."
    >
      <AgentServerPanel />
    </SettingsSection>
  );
}
