import type { PairRow } from "./pair-row.types";

/** A link read for showing: its site, its path and the settings after `?`. */
export interface UrlParts {
  ok: boolean;
  host: string;
  path: string;
  params: PairRow[];
}
