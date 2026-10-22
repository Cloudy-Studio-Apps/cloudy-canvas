import type { EngineLoading } from "@canvas";

export interface CanvasLoadingOverlayProps {
  /** e.g. "Opening design". */
  title: string;
  /** The engine's step; `null` while the file itself is still being read. */
  loading: EngineLoading | null;
}
