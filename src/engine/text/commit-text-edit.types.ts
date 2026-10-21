import type { EditableShape } from "../document";

export interface TextEdit {
  shape: EditableShape;
  text: string;
  /** The shape isn't in the document yet (a new text box). */
  isDraft: boolean;
}
