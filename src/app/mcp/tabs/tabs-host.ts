import type { FileTab, TabsAgentHost, AgentFileMatch, AgentTab } from "@canvas";
import { sameFileName } from "@canvas";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { fileTabs } from "../../tabs/file-tabs-instance";
import { bindAgentToTab } from "../agent-open-tab";
import type { AgentTabs } from "../agent-tab-binding.types";
import { knownProjects } from "./agent-project-files";

/** The tab tools' host for one agent session: the open tabs, and moving to one by name. */
export function tabsHostFor(session: string, tabs: AgentTabs): TabsAgentHost {
  const agentTab = (tab: FileTab): AgentTab => {
    const known = useCollaboratorsStore.getState().collaborators;
    return {
      name: tab.name,
      type: tab.type,
      mine: tab.agents.includes(session),
      collaborators: tab.agents.map((id) => known[id]?.name).filter((n): n is string => !!n),
    };
  };
  return {
    tabs: () => fileTabs.store.get().tabs.map(agentTab),
    switchTab: async (name) => {
      const found = fileTabs.store.get().tabs.filter((tab) => sameFileName(tab.name, name));
      if (found.length === 0) {
        const open = fileTabs.store.get().tabs.map((tab) => `"${tab.name}"`);
        throw new Error(
          `No open tab named "${name}". Open tabs: ${open.length > 0 ? open.join(", ") : "none"}.`,
        );
      }
      const [only, ...others] = found;
      if (only && others.length === 0) {
        await bindAgentToTab(tabs, session, only.id);
        return agentTab(fileTabs.get(only.id) ?? only);
      }
      const projects = await knownProjects();
      const candidates = found.map((tab): AgentFileMatch => {
        const info = tab.load.status === "ready" ? tab.load.info : null;
        const project = projects.find((p) => p.id === (tab.params.project ?? ""));
        return {
          name: tab.name,
          type: tab.type,
          project: project?.name ?? null,
          path: info?.path ?? "",
        };
      });
      return { candidates };
    },
  };
}
