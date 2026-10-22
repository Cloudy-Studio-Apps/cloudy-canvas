import { defineService } from "@canvas";

import { ErModel } from "./er-model";

/** The board's ER diagrams, one per engine: `engine.service(ER_MODEL)`. */
export const ER_MODEL = defineService("board.erModel", (doc) => new ErModel(doc));
