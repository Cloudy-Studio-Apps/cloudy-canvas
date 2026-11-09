import type { CollectionRecord, DocumentTokens, ModeAxisRecord, TokenStore } from "@canvas";
import type { TokenSource } from "@canvas-ui";
import type { DesignEngine } from "../../../../design-engine.types";

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
  /** Where the collection comes from, when it's a project library's (`null`: the file's own). */
  source: TokenSource | null;
  /** The collection can be edited here (its variables, groups and generators). */
  editable: boolean;
  /** Whether a record (a variable, an axis) can be edited here. */
  canEdit: (record: unknown) => boolean;
}
