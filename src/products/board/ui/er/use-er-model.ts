import { ER_MODEL, type ErModel } from "@board";
import { useService } from "@canvas-ui";

/** The open board's ER diagrams (the engine's `ER_MODEL` service). */
export function useErModel(): ErModel {
  return useService(ER_MODEL);
}
