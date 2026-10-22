import type { ElementBuildContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";

/** What a kind builds a node from an agent's spec with (`DesignNodeKind.buildNode`). */
export interface NodeBuildContext extends ElementBuildContext {
  /** The tool options in effect, for what the spec leaves out (e.g. the frame preset). */
  readonly options: DesignToolOptions;
  /** A free layer name from `base` ("Rectangle" → "Rectangle 3"), counting this call's nodes. */
  nameFor(base: string): string;
}
