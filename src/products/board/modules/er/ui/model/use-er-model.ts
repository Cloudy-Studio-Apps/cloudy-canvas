import { ER_MODEL } from "../../model/er-model.service";
import type { ErModel } from "../../model/er-model";
import { useService } from "@canvas-ui";

/** The open board's ER diagrams (the engine's `ER_MODEL` service). */
export function useErModel(): ErModel {
  return useService(ER_MODEL);
}
