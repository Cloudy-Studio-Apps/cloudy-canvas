import { useDesignEngine } from "@design/ui/design-engine-context";
import { setRepeat } from "../../repeat";
import { runRepeat } from "./run-repeat";
import type { ApplyRepeat } from "./use-set-repeat.types";

/** `setRepeat` on one frame, one undo step; the data sync then makes its copies. */
export function useSetRepeat(frameId: string): ApplyRepeat {
  const engine = useDesignEngine();
  return (repeat, opts) => runRepeat(() => setRepeat(engine.doc, frameId, repeat, opts));
}
