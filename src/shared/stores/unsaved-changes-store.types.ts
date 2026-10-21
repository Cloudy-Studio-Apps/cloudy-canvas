export interface UnsavedChangesState {
  /** The open editor has changes that aren't saved yet. */
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
}
