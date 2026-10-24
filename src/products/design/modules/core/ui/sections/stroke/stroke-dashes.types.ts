import type { DesignNode } from "@design";

/** How a stroke is dashed, as the settings offer it. */
export type DashStyle = "solid" | "dashed" | "dotted" | "custom";

/** What dashes are read from and sized by: a layer's stroke, or a stroke style's. */
export type StrokeLook = Pick<DesignNode, "strokeDashes" | "strokeCap" | "strokeWeight">;
