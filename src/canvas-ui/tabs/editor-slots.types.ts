/** Which tabs have their editor's slot mounted (`editorSlots`). */
export interface EditorSlots {
  /** Marks the tab's slot mounted; returns how to mark it unmounted. */
  mount(id: string): () => void;
  /**
   * Resolves once the tab's slot unmounted (after that commit's cleanups ran); at once when it
   * isn't mounted.
   */
  whenUnmounted(id: string): Promise<void>;
}
