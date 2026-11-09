/** What the app can ask of a tab's file while its editor is mounted (`tabHandles`). */
export interface TabHandle {
  /** Saves the file (asking where the first time); `false` when cancelled or failed. */
  save(): Promise<boolean>;
  /** Runs the pending autosave now and waits for it (nothing when autosave is off). */
  flush(): Promise<void>;
  /**
   * The closing work, for a document about to go (the tab closing or hibernating): the engine's
   * last writes (a live 3D edit), the sweep of unused assets, then the pending autosave, while
   * the document is still there.
   */
  finish(): Promise<void>;
  /**
   * Once the editor unmounted: resolves when the work and save it started then are done (its
   * last save has the document's data). At once while it's mounted.
   */
  closed(): Promise<void>;
  /** Takes the file's preview for Home now (skipped when it didn't change). */
  capture(): Promise<void>;
  /** Whether the file has changes nothing will save (autosave off or failing). */
  needsSave(): boolean;
}

/** The handles of the tabs whose editor is mounted, by tab id. */
export interface TabHandles {
  /** Registers the tab's handle; returns how to remove it. */
  set(id: string, handle: TabHandle): () => void;
  get(id: string): TabHandle | undefined;
  /** Calls `listener` with each handle of the tab removed (its editor unmounting); returns how to stop. */
  onRemove(id: string, listener: (handle: TabHandle) => void): () => void;
}
