import { ElementKind, type ElementDescription } from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import { ER_DEFAULTS } from "./er.defaults";
import { LEGACY_ER_NOTATION } from "./er-notation";
import { NO_ER_DIAGRAM } from "./no-er-diagram";
import type { ErElement, ErNotation } from "./er.types";

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

  /**
   * Elements saved before boards held several diagrams have none (see `migrateErDiagrams`), and
   * ones saved before notations have none either.
   */
  override fillDefaults(el: E): E {
    if (el.diagram === undefined) return { ...el, ...NO_ER_DIAGRAM, notation: LEGACY_ER_NOTATION };
    // Diagrams from before notations keep reading the ratio label the first way.
    if (el.notation === undefined) return { ...el, notation: LEGACY_ER_NOTATION };
    // The notation's preset was its standard's first name (`chen` then was today's default).
    if ("preset" in el.notation) {
      const notation: ErNotation & { preset?: unknown } = { ...el.notation };
      delete notation.preset;
      return { ...el, notation };
    }
    return el;
  }

  override describe(el: E): ElementDescription {
    return { ...("name" in el && el.name ? { label: el.name } : {}), group: el.diagram };
  }
}
