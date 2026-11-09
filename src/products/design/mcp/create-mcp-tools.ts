import { collectMcpTools, mcpToolOwner, type CollectedMcpTools, type ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { DesignToolOptions } from "../design-options.types";
import { designMcpTools } from "../design-points";
import type { DesignAgentHost } from "./design-mcp.types";

/**
 * Every tool agents can call on designs: the groups the design's modules contribute to
 * `designMcpTools`, in module order, named with their owner's prefix (`collectMcpTools`).
 * `pluginOf` tells which plugin a module belongs to; `reserved` holds the built-in prefixes a
 * plugin id may not take.
 */
export function createDesignMcpTools(
  modules: ModuleHost,
  kinds: ElementKinds<DesignToolOptions>,
  pluginOf: (moduleId: string) => string | undefined,
  reserved: ReadonlySet<string>,
): CollectedMcpTools<DesignAgentHost> {
  return collectMcpTools(
    modules.get(designMcpTools),
    { kinds },
    (group) => mcpToolOwner(modules, designMcpTools, group.id, pluginOf),
    reserved,
  );
}
