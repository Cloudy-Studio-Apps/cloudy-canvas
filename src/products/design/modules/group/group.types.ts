import type { DesignNode } from "../core";

/**
 * A group: layers that select and move as one. Its bounds always wrap its children (resolved on
 * every change; the stored ones are stale), and it draws nothing of its own.
 */
export interface GroupElement extends DesignNode {
  type: "group";
}
