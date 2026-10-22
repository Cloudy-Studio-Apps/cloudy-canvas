import { createCanvasPoints } from "@canvas";
import { definePoint } from "@shared/core";

import type { DesignAgentToolGroup } from "./agent/design-agent.types";
import type { DesignToolOptions } from "./design-options.types";
import type { DesignMigration } from "./file/design-migration.types";

/** The points the design's canvas is assembled from (see `composeProduct`). */
export const designCanvas = createCanvasPoints<DesignToolOptions>("design");

/** Tools agents can call on the open design, one group per module (or per group file). */
export const designAgentTools = definePoint<DesignAgentToolGroup>("design.agentTools", {
  keyOf: (group) => group.id,
});

/** What brings an older design file up to date when it opens, run in module order. */
export const designMigrations = definePoint<DesignMigration>("design.migrations", {
  keyOf: (migration) => migration.id,
});
