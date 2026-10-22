/** What `CanvasEngine.mount` is doing before the canvas can be used, for a loading screen. */
export interface EngineLoading {
  /** e.g. "Drawing layers". */
  stage: string;
  /** How far the stage has got, when it can count. */
  progress: { done: number; total: number } | null;
}
