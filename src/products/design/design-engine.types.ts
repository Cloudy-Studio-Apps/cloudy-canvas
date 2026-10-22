import type { CanvasEngine, EngineState } from "@canvas";

import type { DesignToolOptions } from "./design-options.types";

/** The engine editing a design. */
export type DesignEngine = CanvasEngine<DesignToolOptions>;
export type DesignEngineState = EngineState<DesignToolOptions>;
