import { useMemo } from "react";

import { DEFAULT_MODE } from "@canvas";
import { useEngine, useEngineState } from "../engine-context";
import { useOptionalEditorPoint } from "./editor-modules-context";
import type { EditorModeContext } from "./editor-points.types";

/** The mode the editor is in, its entry, and switching or leaving it. */
export function useEditorMode(): EditorModeContext {
  const engine = useEngine();
  const id = useEngineState((state) => state.mode);
  const entries = useOptionalEditorPoint((points) => points.modes);
  return useMemo(
    () => ({
      id,
      entry: entries.find((entry) => entry.id === id),
      isDefault: id === DEFAULT_MODE.id,
      setMode: (next: string) => engine.setMode(next),
      leave: () => engine.setMode(DEFAULT_MODE.id),
    }),
    [engine, entries, id],
  );
}
