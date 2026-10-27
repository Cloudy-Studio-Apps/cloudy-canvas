import { AgentServerPanel } from "@shared/agent-server";
import { SettingsSection } from "../components/settings-section";
import { t } from "../settings.i18n";

export function AgentsSection() {
  return (
    <SettingsSection id="agents" title={t("nav.agents")} description={t("agents.description")}>
      <AgentServerPanel />
    </SettingsSection>
  );
}
