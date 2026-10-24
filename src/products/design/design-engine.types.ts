import type { CanvasEngine, CanvasWorkspace, EngineState } from "@canvas";

import type { DesignToolOptions } from "./design-options.types";

/** The engine editing a design. */
export type DesignEngine = CanvasEngine<DesignToolOptions>;
export type DesignEngineState = EngineState<DesignToolOptions>;
/**
 * The context an agent edits a design in (its own page, selection and undo history), or the
 * engine itself (the user's), see `CanvasWorkspace`.
 */
export type DesignWorkspace = CanvasWorkspace<DesignToolOptions>;
