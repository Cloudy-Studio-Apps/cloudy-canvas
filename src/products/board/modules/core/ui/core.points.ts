import { definePoint } from "@shared/core";

import type { BoardStarter } from "./core.points.types";

/** Ready-made starts for a new board, listed on Home's first run (see `useBoardStartStarter`). */
export const boardStarters = definePoint<BoardStarter>("board.starters", {
  keyOf: (starter) => starter.id,
});
