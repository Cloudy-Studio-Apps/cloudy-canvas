import type { CanvasMode } from "@canvas";

import { generatedMark, isSheet } from "../sheet";
import { STYLEGUIDE_ALLOWED_COMMANDS } from "./styleguide-allowed-commands";
import { STYLEGUIDE_MODE_ID, STYLEGUIDE_TOOL } from "./styleguide-mode.constants";

/**
 * The Design system mode: the system page's sections (one live element per category) can be
 * pointed at, selected and exported, never edited; the select-only tool and the hand work.
 */
export const STYLEGUIDE_MODE: CanvasMode = {
  id: STYLEGUIDE_MODE_ID,
  tool: STYLEGUIDE_TOOL,
  tools: ["hand"],
  // The sections and what they generated (or it would be dimmed); clicks on a generated layer
  // still select its section (`sheetRedirect`).
  isolate: (el) => (isSheet(el) && el.parentId === null) || generatedMark(el) !== null,
  commands: STYLEGUIDE_ALLOWED_COMMANDS,
};
