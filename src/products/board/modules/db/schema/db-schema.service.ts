import { defineService } from "@canvas";

import { DbSchema } from "./db-schema";

/** The board's database schema, one per engine: `engine.service(DB_SCHEMA)`. */
export const DB_SCHEMA = defineService("board.dbSchema", (doc) => new DbSchema(doc));
