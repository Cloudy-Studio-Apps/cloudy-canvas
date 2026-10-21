import { useParams } from "react-router";

import { BoardEditor } from "./board-editor";

/** `/board/:id`. Keyed by id so switching boards starts a fresh editor. */
export function BoardEditorPage() {
  const { id = "" } = useParams<{ id: string }>();
  return <BoardEditor key={id} id={id} />;
}
