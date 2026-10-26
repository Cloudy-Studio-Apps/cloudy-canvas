import type { TokenContext } from "@canvas";

/**
 * The board's modes: one pick per mode axis for the whole board (each axis's `current`), so no
 * element has modes of its own and a mode change follows only from the elements it names.
 */
export const BOARD_TOKEN_CONTEXT: TokenContext = {
  modesOf: () => ({}),
  modeDependents: (_doc, ids) => new Set(ids),
};
