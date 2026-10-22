import { useEngineState } from "@canvas-ui";
import { useErModel } from "./use-er-model";
import { useErVersion } from "./use-er-version";
import type { ErSelection } from "./use-er-selection.types";

/** The selection as far as ER diagrams go; re-read when the selection or a diagram changes. */
export function useErSelection(): ErSelection {
  const er = useErModel();
  const ids = useEngineState((state) => state.selectedIds);
  useErVersion();
  const elements = ids.flatMap((id) => er.shape(id) ?? []);
  const diagrams = new Set(elements.map((el) => el.diagram));
  return {
    any: elements.length > 0,
    id: ids.length === 1 ? (elements[0]?.id ?? null) : null,
    diagram: diagrams.size === 1 ? ([...diagrams][0] ?? null) : null,
  };
}
