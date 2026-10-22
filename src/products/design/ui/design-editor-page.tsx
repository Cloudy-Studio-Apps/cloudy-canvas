import { useParams } from "react-router";

import { DesignEditor } from "./design-editor";

/** `/design/:id`. Keyed by id so switching designs starts a fresh editor. */
export function DesignEditorPage() {
  const { id = "" } = useParams<{ id: string }>();
  return <DesignEditor key={id} id={id} />;
}
