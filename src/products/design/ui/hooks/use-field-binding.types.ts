import type { BindableField, ModeContext } from "@canvas";

/** How a field of the selected layers relates to variables (see `useFieldBinding`). */
export interface FieldBinding {
  /** The field as the first layer's kind describes it; `undefined` when some layer lacks it. */
  field: BindableField | undefined;
  /** The variable every layer binds it to; `null`: bound to different ones; `undefined`: unbound. */
  bound: string | null | undefined;
  /** The modes the first layer uses (values shown in the picker). */
  modes: ModeContext;
  /** Binds the field of every layer (`null` detaches it), one undo step. */
  bind: (variableId: string | null) => void;
}
