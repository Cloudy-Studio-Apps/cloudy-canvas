import type { FigOverride, FigPropAssignment } from "@canvas/figma";

/** What an instance changes on the nodes of its component, by their path inside it. */
export interface InstanceScope {
  /** Overridden fields, applied in order. */
  overrides: ReadonlyMap<string, readonly FigOverride[]>;
  /** The resolved layout (size, transform), applied after the overrides. */
  derived: ReadonlyMap<string, readonly FigOverride[]>;
  /** The instance's component property values, by property id. */
  props: ReadonlyMap<string, FigPropAssignment>;
}
