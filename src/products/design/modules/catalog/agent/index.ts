import type { DesignAgentTool } from "../../../agent";
import { brochureEditTools } from "./brochure-edit.agent-tools";
import { brochureListTools } from "./brochure-list.agent-tools";
import { brochureReadTools } from "./brochure-read.agent-tools";
import { brochureSettingsTools } from "./brochure-settings.agent-tools";

/**
 * The brochures of the Catalog mode: a design page's top-level frames as a print catalog's pages
 * (a page can hold several brochures).
 */
export const catalogTools: DesignAgentTool[] = [
  ...brochureListTools,
  ...brochureReadTools,
  ...brochureEditTools,
  ...brochureSettingsTools,
];
