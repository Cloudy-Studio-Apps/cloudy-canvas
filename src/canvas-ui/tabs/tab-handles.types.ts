/** What the app can ask of a tab's file while its editor is mounted (`tabHandles`). */
export interface TabHandle {
  /** Saves the file (asking where the first time); `false` when cancelled or failed. */
  save(): Promise<boolean>;
  /** Runs the pending autosave now and waits for it (nothing when autosave is off). */
  flush(): Promise<void>;
  /**
   * The editor's closing work, for a tab about to close: the engine's last writes (a live 3D
   * edit), then the pending autosave, while the document is still there.
   */
  finish(): Promise<void>;
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
}
