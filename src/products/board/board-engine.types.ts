import type { CanvasEngine, EngineState } from "@canvas";

import type { BoardToolOptions } from "./board-options.types";

/** The engine editing a board. */
export type BoardEngine = CanvasEngine<BoardToolOptions>;
export type BoardEngineState = EngineState<BoardToolOptions>;
