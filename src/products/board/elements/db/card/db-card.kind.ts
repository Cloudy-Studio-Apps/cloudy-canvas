import { ElementKind, type ElementDescription } from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import type { DbCardElement } from "./db-card.types";

/**
 * Tables and enums: cards sized by their content (not resizable), created with the Database tool
 * or from DBML, never from an agent's shape spec. Their content is edited in the database panel.
 */
export abstract class DbCardKind<E extends DbCardElement> extends ElementKind<E, BoardToolOptions> {
  override readonly tool = "db";
  override readonly creatable = false;
  override readonly connectable = true;
  /** Agents edit tables and enums as DBML, not by patching fields. */
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y"]);

  override describe(el: E): ElementDescription {
    return { label: el.name };
  }
}
