import { definePoint } from "@shared/core";

import type { TokenFormat } from "./token-format.types";

/** The formats tokens import from and export to, by id. */
export const tokenFormats = definePoint<TokenFormat>("design.tokenFormats", {
  keyOf: (format) => format.id,
});
