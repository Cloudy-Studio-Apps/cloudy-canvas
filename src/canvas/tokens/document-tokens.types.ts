import type { ScaleRecord } from "./scale-generator.types";
import type { GeneratorRecord } from "./shade-generator.types";
import type { TokenCodeSyntax, TokenScope, TokenValue, VariableType } from "./token.types";

/** What a new variable needs; its value goes to every mode of its collection. */
export interface NewVariable {
  collectionId: string;
  name: string;
  type: VariableType;
  value: TokenValue;
  scopes?: TokenScope[];
  description?: string;
  codeSyntax?: TokenCodeSyntax;
  hidden?: boolean;
  /** The colors it's read with (declared contrast pairs). */
  contrastWith?: string[];
}

/** The fields of a variable that change without touching its values. */
export interface VariablePatch {
  name?: string;
  scopes?: TokenScope[];
  description?: string;
  codeSyntax?: TokenCodeSyntax;
  hidden?: boolean;
  /** The colors it's read with (declared contrast pairs); `[]` clears them. */
  contrastWith?: string[];
}

export interface SetValueOptions {
  /** `false` joins the previous undo step (a picker drag's steps). Default `true`. */
  checkpoint?: boolean;
}

/** What a new style needs. */
export interface NewStyle {
  styleType: string;
  name: string;
  value: Record<string, unknown>;
  description?: string;
  /**
   * Variables driving parts of the value (paths in it); those that don't fit are left out, and
   * the value takes their values in the file's modes.
   */
  bindings?: Record<string, string>;
}

/** The fields of a style that change. */
export interface StylePatch {
  name?: string;
  description?: string;
  value?: Record<string, unknown>;
  /**
   * Its variables after the change (a stack reordered moves them). Unset: the ones whose value
   * `value` wrote differently are unlinked.
   */
  bindings?: Record<string, string>;
}

/** What `saveGenerator` takes: a generator without its stored bookkeeping (`id` to change one). */
export type GeneratorInput = Omit<GeneratorRecord, "kind" | "id" | "order" | "axisId"> & {
  id?: string;
  axisId?: string | null;
};

/** What `saveScale` takes: a scale without its stored bookkeeping (`id` to change one). */
export type ScaleInput = Omit<ScaleRecord, "kind" | "id" | "order"> & { id?: string };
