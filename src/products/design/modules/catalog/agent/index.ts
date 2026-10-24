import type { DesignAgentTool } from "../../../agent";
import { brochureEditTools } from "./brochure-edit.agent-tools";
import { brochureReadTools } from "./brochure-read.agent-tools";
import { brochureSettingsTools } from "./brochure-settings.agent-tools";

/** The brochure of the Catalog mode: a design's top-level frames as a print catalog's pages. */
export const catalogTools: DesignAgentTool[] = [
  ...brochureReadTools,
  ...brochureEditTools,
  ...brochureSettingsTools,
];
