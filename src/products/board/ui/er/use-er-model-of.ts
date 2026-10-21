import { useMemo } from "react";

import { ErModel, type BoardEngine } from "@board";

/** The ER diagrams of the engine's document. */
export function useErModelOf(engine: BoardEngine): ErModel {
  return useMemo(() => new ErModel(engine.doc), [engine]);
}
