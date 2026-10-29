import { definePoint } from "@shared/core";

import type { DbPanelAction } from "./db.points.types";

/** Buttons other modules add to the database panel's header, after Tidy up. */
export const dbPanelActions = definePoint<DbPanelAction>("board.dbPanelActions", {
  keyOf: (action) => action.id,
});
