export interface EditNodesOptions {
  /** Starts a new undo step (default). `false` joins the current one, e.g. while dragging. */
  checkpoint?: boolean;
}
