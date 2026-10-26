import type { CollectionRecord, ModeAxisRecord, TokenScope, VariableType } from "../../token.types";

/** A Tokens Studio theme: which token sets it turns on. */
export interface StudioTheme {
  name: string;
  /** Themes of one group are the modes of one axis. */
  group?: string;
  selectedTokenSets: Record<string, "enabled" | "source" | "disabled">;
}

/** A token as found in a set, its path relative to the set. */
export interface StudioToken {
  set: string;
  path: string[];
  type: string;
  value: unknown;
  description: string;
}

/** How a Tokens Studio type becomes a variable. */
export interface StudioType {
  type: VariableType;
  scopes: TokenScope[];
}

/** The variable a path of a collection becomes, and the tokens giving its values. */
export interface StudioSlot {
  collection: CollectionRecord;
  /** The axis it varies by, when its sets are turned on by some themes only. */
  axis?: ModeAxisRecord;
  tokens: StudioToken[];
}
