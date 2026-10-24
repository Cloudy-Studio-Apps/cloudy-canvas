import type { CanvasEngine, CanvasWorkspace, EngineState } from "@canvas";

import type { BoardToolOptions } from "./board-options.types";

/** The engine editing a board. */
export type BoardEngine = CanvasEngine<BoardToolOptions>;
export type BoardEngineState = EngineState<BoardToolOptions>;
/**
 * The context an agent edits a board in (its own page, selection and undo history), or the
 * engine itself (the user's), see `CanvasWorkspace`.
 */
export type BoardWorkspace = CanvasWorkspace<BoardToolOptions>;
