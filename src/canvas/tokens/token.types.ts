import type { ScaleRecord } from "./scale-generator.types";
import type { GeneratorRecord } from "./shade-generator.types";

/** The kinds of value a variable holds. */
export type VariableType = "color" | "number" | "string" | "boolean";

/**
 * Where a variable may be used (Figma's scoping): pickers only offer it for fields of these
 * scopes. A variable with no scopes is offered everywhere its type fits.
 */
export type TokenScope =
  | "all-fills"
  | "frame-fill"
  | "shape-fill"
  | "text-fill"
  | "stroke-color"
  | "effect-color"
  | "corner-radius"
  | "width-height"
  | "gap"
  | "padding"
  | "stroke-weight"
  | "opacity"
  | "font-size"
  | "line-height"
  | "letter-spacing"
  | "font-weight"
  | "effect-value"
  | "other-number"
  | "text-content"
  | "font-family"
  | "font-style";

/** One mode of an axis (Light, Dark, Brand A, Mobile…). */
export interface ModeDef {
  id: string;
  name: string;
}

/**
 * A file-wide choice of modes (Theme: Light/Dark, Device: Mobile/Desktop). Its first mode is the
 * base: variables' default values are its values. `current` is the mode the file shows (pages
 * and frames may pick another). Axes combine freely; a file starts with one.
 */
export interface ModeAxisRecord {
  kind: "axis";
  id: string;
  name: string;
  /** At least one; the first is the base. */
  modes: ModeDef[];
  /** The mode the file shows; the base when unset or gone. */
  current?: string;
  /** Fractional index ordering the axes. */
  order: string;
}

/**
 * A folder of variables (Primitives, Semantic, Spacing…). Files from before mode axes kept their
 * modes here; opening them moves those modes to an axis (`modes` then stays unset).
 */
export interface CollectionRecord {
  kind: "collection";
  id: string;
  name: string;
  /** Only in files from before mode axes. */
  modes?: ModeDef[];
  /** Fractional index ordering the collections. */
  order: string;
}

/** A variable's value: a raw value, or another variable's (an alias). */
export type TokenValue =
  | { color: string }
  | { number: number }
  | { string: string }
  | { boolean: boolean }
  | { alias: string };

/**
 * A named value. `values[DEFAULT_VALUE]` is its value in every mode it has no override for; with
 * `axisId`, it varies by that axis: `values[modeId]` overrides it for that mode (the axis's first
 * mode uses the default).
 */
export interface VariableRecord {
  kind: "variable";
  id: string;
  collectionId: string;
  /** A slash path (`brand/primary/500`): its groups and its own name, unique in its collection. */
  name: string;
  type: VariableType;
  /** The shade generator or scale that made it (and keeps it linked to its base), if any. */
  generatorId?: string | null;
  /** The axis it varies by; unset or `null`: the same in every mode. */
  axisId?: string | null;
  /** `DEFAULT_VALUE`, and overrides by mode id of its axis. */
  values: Record<string, TokenValue>;
  /** Where it's offered; empty: everywhere its type fits. */
  scopes: TokenScope[];
  description: string;
  /** Its name in code, per platform. */
  codeSyntax: TokenCodeSyntax;
  /** Left out of the Design System view and the pickers' default list. */
  hidden: boolean;
  /** Fractional index ordering it within its collection. */
  order: string;
  /** Color variables it's meant to be read with (text on a surface): checked for contrast. */
  contrastWith?: string[];
}

export interface TokenCodeSyntax {
  web?: string;
  ios?: string;
  android?: string;
}

/**
 * A named, composite look (Figma's styles): a text style's typography, later colors and effects.
 * Its `value` is plain JSON the product's kinds read (`styleType` says which); styles have no
 * modes.
 */
export interface StyleRecord {
  kind: "style";
  id: string;
  /** e.g. `"text"`. */
  styleType: string;
  /** A slash path, like a variable's. */
  name: string;
  value: Record<string, unknown>;
  /**
   * Variables driving parts of its value (a path in `value`, `"paints.0.color"` → variable id).
   * `value` keeps their values in the file's modes; layers get them in their own modes.
   */
  bindings?: Record<string, string>;
  description: string;
  /** Fractional index ordering it among the styles of its type. */
  order: string;
}

/** What the document's `"tokens"` map holds, by id. */
export type TokenRecord =
  ModeAxisRecord | CollectionRecord | VariableRecord | StyleRecord | GeneratorRecord | ScaleRecord;

/** Which mode of each axis applies (axis id → mode id); missing ones use the axis's `current`. */
export type ModeContext = Readonly<Record<string, string>>;

/** A variable's value once aliases are followed. Colors are `#RRGGBBAA`. */
export type ResolvedValue =
  | { type: "color"; color: string }
  | { type: "number"; number: number }
  | { type: "string"; string: string }
  | { type: "boolean"; boolean: boolean }
  | { type: "style"; styleType: string; value: Readonly<Record<string, unknown>> };
