import type { CanvasEngine, EngineLoading } from "@canvas";

/** An editor's engine once it's ready to use, and what it's doing until then. */
export interface CanvasEngineHost<O extends object> {
  /** `null` until the engine has mounted (and after it closes). */
  engine: CanvasEngine<O> | null;
  /** The mount's current step while it loads, otherwise `null`. */
  loading: EngineLoading | null;
}
