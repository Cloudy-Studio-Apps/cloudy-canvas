import type { OpenDesign } from "@design";
import { createActiveFile } from "@canvas-ui";

/** The design open in the window, for agents (see `app/mcp`, which gives each one a workspace). */
export const activeDesign = createActiveFile<OpenDesign>("design");

export const getActiveDesign = (): OpenDesign | null => activeDesign.get();
/** Resolves once design `id` is open and ready; rejects if it isn't within the timeout. */
export const waitForActiveDesign = (id: string): Promise<OpenDesign> => activeDesign.waitFor(id);
