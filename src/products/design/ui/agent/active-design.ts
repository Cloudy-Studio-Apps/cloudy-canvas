import type { OpenDesign } from "@design";
import { createAgentFiles } from "@canvas-ui";

/** Each tab's design, for agents (see `app/mcp`, which binds each one to a tab). */
export const designFiles = createAgentFiles<OpenDesign>();

/** The design of the tab on screen, or `null`. */
export const getActiveDesign = (): OpenDesign | null => designFiles.active();
