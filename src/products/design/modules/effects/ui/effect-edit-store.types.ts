export interface EffectEditState {
  /** The id of the effect whose editor is open (its handles show on the canvas), or `null`. */
  editing: string | null;
  setEditing: (id: string | null) => void;
}
