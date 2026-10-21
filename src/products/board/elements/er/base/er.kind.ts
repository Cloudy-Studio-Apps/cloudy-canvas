import { ElementKind, type ElementDescription } from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import { ER_DEFAULTS } from "./er.defaults";
import { NO_ER_DIAGRAM } from "./no-er-diagram";
import type { ErElement } from "./er.types";

/**
 * Every ER element: part of one diagram on the board, created with the ER tool or from the ER
 * text, never from an agent's shape spec (agents edit diagrams as text and may only move
 * elements). The diagram's content is edited in the ER panel.
 */
export abstract class ErKind<E extends ErElement> extends ElementKind<E, BoardToolOptions> {
  override readonly tool = "er";
  override readonly defaults = ER_DEFAULTS;
  override readonly creatable = false;
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y"]);

  /** Elements saved before boards held several diagrams have none (see `migrateErDiagrams`). */
  override fillDefaults(el: E): E {
    return el.diagram === undefined ? { ...el, ...NO_ER_DIAGRAM } : el;
  }

  override describe(el: E): ElementDescription {
    return { ...("name" in el && el.name ? { label: el.name } : {}), group: el.diagram };
  }
}
