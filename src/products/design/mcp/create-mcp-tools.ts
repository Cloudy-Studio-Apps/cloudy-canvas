import { collectMcpTools, type ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { DesignToolOptions } from "../design-options.types";
import { designMcpTools } from "../design-points";
import type { DesignMcpTool, DesignMcpToolGroup } from "./design-mcp.types";

/**
 * Every tool agents can call on designs: the groups the design's modules contribute to
 * `designMcpTools`, in module order. A tool whose name is in `taken` or an earlier one took is
 * left out and passed to `onSkipped`.
 */
export function createDesignMcpTools(
  modules: ModuleHost,
  kinds: ElementKinds<DesignToolOptions>,
  onSkipped?: (tool: DesignMcpTool, group: DesignMcpToolGroup) => void,
  taken?: Set<string>,
): DesignMcpTool[] {
  return collectMcpTools(modules.get(designMcpTools), { kinds }, onSkipped, taken);
}
