/** An engine's work before its closing save, once started. */
export interface FinalWork {
  /** The engine it belongs to (compared by identity). */
  engine: object;
  /** Whether the work changed the document. */
  done: Promise<boolean>;
}

/** What a file's saver can ask of its autosave. */
export interface AutosaveControls {
  /** Runs the pending autosave now and waits for it. */
  flush(): Promise<void>;
  /**
   * The closing work now: the engine's last writes (`finishBeforeSave`, then the sweep), then the
   * autosave, forced when that work changed the document.
   */
  finish(): Promise<void>;
  /**
   * Resolves once the work and save started as the editor unmounted are done (the save has
   * written the document's data); at once while the editor is mounted. Read after the unmount.
   */
  closed(): Promise<void>;
}
