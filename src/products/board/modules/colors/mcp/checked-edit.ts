import { asUndoStep, CanvasDocument, DocumentTokens, ElementKinds } from "@canvas";

/**
 * Runs an agent's color edit as one undo step of `doc`, with its `tokens`, after running it once
 * on a copy of the board's colors: a call that fails partway (an unknown mode, an alias loop)
 * throws before anything is written.
 */
export function checkedTokenEdit<T>(
  doc: CanvasDocument,
  tokens: DocumentTokens,
  edit: (tokens: DocumentTokens) => T,
): T {
  const copy = new CanvasDocument(new ElementKinds());
  copy.setTokenRecords(doc.tokenRecords());
  edit(new DocumentTokens(copy));
  return asUndoStep(doc, () => edit(tokens));
}
