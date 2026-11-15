import { VARIANT_WAIT_MS, variantLabels, type VariantsAgentHost } from "@canvas";
import { variantChoices } from "@canvas-ui";
import type { AgentTabs } from "../agent-tab-binding.types";
import { tabAgentFile } from "../agent-tab-files";
import { NO_FILE_OPEN } from "../agent-tool-dispatch";
import { sessionTab } from "../session-tab";

/** The shortest wait, when readying the tab took nearly all of it. */
const MIN_WAIT_MS = 1_000;

/**
 * The variant tools' host for one session: the variants must be top-level elements on the page
 * the agent works on in its tab; the chooser shows over that tab. The wait counts from
 * `startedAt` (the call's start, before its tab was readied), so the call always answers inside
 * the transport's 30 s.
 */
export function variantsHostFor(
  session: string,
  tabs: AgentTabs,
  startedAt: number,
): VariantsAgentHost {
  return {
    chooseVariants: async (args) => {
      const tabId = sessionTab(tabs, session);
      const file = tabId === null ? null : tabAgentFile(tabId);
      if (tabId === null || !file) throw new Error(NO_FILE_OPEN);
      const workspace = file.engine.workspace(session);
      for (const id of args.ids) {
        if (!workspace.getElement(id)) throw new Error(`No element with id ${id} on your page.`);
        if (file.engine.rootOf(id) !== id) {
          throw new Error(`${id} is inside another element: give the top-level variants.`);
        }
      }
      return variantChoices.open(
        {
          session,
          tabId,
          scope: workspace.scope,
          ids: args.ids,
          labels: args.labels ?? variantLabels(args.ids.length),
          question: args.question ?? null,
        },
        Math.max(MIN_WAIT_MS, VARIANT_WAIT_MS - (Date.now() - startedAt)),
      );
    },
    variantChoice: () => variantChoices.last(session),
  };
}
