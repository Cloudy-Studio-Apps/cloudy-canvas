import type { DesignNode } from "../node";

/** Each parent's children (`null`: the top of the page), topmost first. */
export type LayerTree = ReadonlyMap<string | null, readonly DesignNode[]>;
