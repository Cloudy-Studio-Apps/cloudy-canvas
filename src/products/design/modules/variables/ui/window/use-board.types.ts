import type { CollectionRecord, DocumentTokens, ModeAxisRecord, TokenStore } from "@canvas";
import type { DesignEngine } from "@design";

import type { BoardMode } from "./board-model.types";

export interface UseBoard {
  engine: DesignEngine;
  tokens: DocumentTokens;
  store: TokenStore;
  /** The collection shown (`undefined` while the file has none). */
  collection: CollectionRecord | undefined;
  axis: ModeAxisRecord | undefined;
  /** Every mode of the axis (or one "Value" without modes). */
  modes: BoardMode[];
  /** The modes the board draws now (all, or the one picked). */
  shown: BoardMode[];
}
