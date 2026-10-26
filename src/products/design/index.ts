// Designs (`.cdesign`, Figma-style). Everything here is engine-side and framework-free: the points
// the design's modules plug into, the node base every element extends, the layer tree, the
// modules' engine side, the agent plumbing and the file format. The React editor is in `ui/`,
// which also composes the product from the modules (`getDesignProduct`).
export type { DesignEngine, DesignEngineState, DesignWorkspace } from "./design-engine.types";
export type { DesignToolOptions } from "./design-options.types";
export {
  designAgentTools,
  designCanvas,
  designMigrations,
  designSelectRedirects,
} from "./design-points";
export type { SelectRedirect } from "./design-points.types";
export * from "./agent";
export * from "./file";
export * from "./modules";
