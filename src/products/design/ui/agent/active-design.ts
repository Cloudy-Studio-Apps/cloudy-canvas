import type { AgentDesign } from "@design";
import { createActiveFile } from "@canvas-ui";

/** The design open in the window, for agents (see `app/mcp`). */
export const activeDesign = createActiveFile<AgentDesign>("design");

export const getActiveDesign = (): AgentDesign | null => activeDesign.get();
/** Resolves once design `id` is open and ready; rejects if it isn't within the timeout. */
export const waitForActiveDesign = (id: string): Promise<AgentDesign> => activeDesign.waitFor(id);
