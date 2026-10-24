import type { CanvasDocument } from "../document";
import type { CanvasElement } from "../elements/element.types";
import type { ModeContext, TokenScope, VariableType } from "./token.types";

/** A field of an element a variable can drive. */
export interface BindableField {
  /** Where it's stored: `"cornerRadius"`, `"fills.0.color"`, `"layout.padding.top"`. */
  path: string;
  /** The variable type it takes, or `"style"` for a style of `styleType`. */
  type: VariableType | "style";
  /** The kind of style it takes (with `type: "style"`). */
  styleType?: string;
  /** The scopes it belongs to (a variable is offered when it has one of them, or none). */
  scopes: TokenScope[];
  /** Names it in pickers and agent replies. */
  label: string;
}

/** What a product tells the token sync about its elements' modes. */
export interface TokenContext {
  /** The mode of each collection that applies to an element (unset collections: their default). */
  modesOf(doc: CanvasDocument, el: CanvasElement): ModeContext;
  /** The ids whose modes follow from the elements whose `variableModes` changed (them included). */
  modeDependents(doc: CanvasDocument, ids: ReadonlySet<string>): Set<string>;
}
