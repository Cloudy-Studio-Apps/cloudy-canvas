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
}

/** The fields of a variable that change without touching its values. */
export interface VariablePatch {
  name?: string;
  scopes?: TokenScope[];
  description?: string;
  codeSyntax?: TokenCodeSyntax;
  hidden?: boolean;
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
}

/** The fields of a style that change. */
export interface StylePatch {
  name?: string;
  description?: string;
  value?: Record<string, unknown>;
}

/** What `saveGenerator` takes: a generator without its stored bookkeeping (`id` to change one). */
export type GeneratorInput = Omit<GeneratorRecord, "kind" | "id" | "order" | "axisId"> & {
  id?: string;
  axisId?: string | null;
};

/** What `saveScale` takes: a scale without its stored bookkeeping (`id` to change one). */
export type ScaleInput = Omit<ScaleRecord, "kind" | "id" | "order"> & { id?: string };
