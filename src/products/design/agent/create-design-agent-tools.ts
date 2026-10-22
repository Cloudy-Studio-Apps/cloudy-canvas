import { collectAgentTools, type ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { DesignToolOptions } from "../design-options.types";
import { designAgentTools } from "../design-points";
import type { DesignAgentTool, DesignAgentToolGroup } from "./design-agent.types";

/**
 * Every tool agents can call on designs: the groups the design's modules contribute to
 * `designAgentTools`, in module order. A tool whose name is in `taken` or an earlier one took is
 * left out and passed to `onSkipped`.
 */
export function createDesignAgentTools(
  modules: ModuleHost,
  kinds: ElementKinds<DesignToolOptions>,
  onSkipped?: (tool: DesignAgentTool, group: DesignAgentToolGroup) => void,
  taken?: Set<string>,
): DesignAgentTool[] {
  return collectAgentTools(modules.get(designAgentTools), { kinds }, onSkipped, taken);
}
