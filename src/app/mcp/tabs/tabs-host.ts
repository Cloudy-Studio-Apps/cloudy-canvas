import type { AgentFileMatch, AgentTab, FileTab, TabsAgentHost } from "@canvas";
import { tabPresenceFileIds } from "@canvas/tabs";
import { sameFileName } from "@canvas";
import type { Collaborator } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { fileTabs } from "../../tabs/file-tabs-instance";
import { bindAgentToTab } from "../agent-open-tab";
import type { AgentTabs } from "../agent-tab-binding.types";
import { knownProjects } from "./agent-project-files";
import { tabDisplayName } from "./tab-display-name";

/** Who is in a tab: the collaborators in its file (the rule of its button's avatars), and its bound agents. */
function collaboratorsIn(tab: FileTab): string[] {
  const known = useCollaboratorsStore.getState().collaborators;
  const fileIds = new Set(tabPresenceFileIds(tab));
  const here = new Map<string, Collaborator>();
  for (const c of Object.values(known))
    if (c.state.fileId && fileIds.has(c.state.fileId)) here.set(c.id, c);
  const names = [...here.values()].map((c) => c.name);
  // A bound agent that hasn't shown presence yet still counts, under a generic label.
  for (const id of tab.agents) if (!here.has(id)) names.push(known[id]?.name ?? "An agent");
  return names;
}

/** The tab tools' host for one agent session: the open tabs, and moving to one by name. */
export function tabsHostFor(session: string, tabs: AgentTabs): TabsAgentHost {
  const agentTab = async (tab: FileTab): Promise<AgentTab> => ({
    name: await tabDisplayName(tab),
    type: tab.type,
    mine: tab.agents.includes(session),
    collaborators: collaboratorsIn(tab),
  });
  return {
    tabs: () => Promise.all(fileTabs.store.get().tabs.map(agentTab)),
    switchTab: async (name) => {
      const all = fileTabs.store.get().tabs;
      const names = await Promise.all(all.map(tabDisplayName));
      const found = all.filter((_, i) => sameFileName(names[i] ?? "", name));
      if (found.length === 0) {
        const open = names.map((n) => `"${n}"`);
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
      const candidates = await Promise.all(
        found.map(async (tab): Promise<AgentFileMatch> => {
          const info = tab.load.status === "ready" ? tab.load.info : null;
          const project = projects.find((p) => p.id === (tab.params.project ?? ""));
          return {
            name: await tabDisplayName(tab),
            type: tab.type,
            project: project?.name ?? null,
            path: info?.path ?? "",
          };
        }),
      );
      return { candidates };
    },
  };
}
