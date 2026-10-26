import type { DesignMcpTool } from "../../../mcp";
import { brochureEditTools } from "./brochure-edit.mcp";
import { brochureListTools } from "./brochure-list.mcp";
import { brochureReadTools } from "./brochure-read.mcp";
import { brochureSettingsTools } from "./brochure-settings.mcp";

/**
 * The brochures of the Catalog mode: a design page's top-level frames as a print catalog's pages
 * (a page can hold several brochures).
 */
export const catalogTools: DesignMcpTool[] = [
  ...brochureListTools,
  ...brochureReadTools,
  ...brochureEditTools,
  ...brochureSettingsTools,
];
