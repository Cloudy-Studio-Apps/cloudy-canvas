import type { DesignNode } from "../../core";

/**
 * Layers by sibling order, ties broken by id, so every device sorts two layers with the same
 * index (two peers' copies made at once) the same way.
 */
export const byIndex = (a: DesignNode, b: DesignNode): number =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
