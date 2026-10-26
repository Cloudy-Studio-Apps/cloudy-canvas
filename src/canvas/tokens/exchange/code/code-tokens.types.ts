import type { VariableType } from "../../token.types";

/** A variable's value as code writes it; colors `#RRGGBBAA`, opacities 0–1. */
export type CodeValue = string | number | boolean;

/** How a number is written: a length, an opacity (0–1), a font size, or a plain number. */
export type CodeUnit = "px" | "font-size" | "opacity" | "none";

/** A variable's value in one mode of an axis, where it differs from its base value. */
export interface CodeModeValue {
  axis: string;
  mode: string;
  value: CodeValue;
  /** Its own value there (not only through an alias): an alias target's `cssName`, or raw. */
  own?: { alias: string } | { value: CodeValue };
}

/** A variable ready for code: its names per platform and its values. */
export interface CodeVariable {
  id: string;
  /** Its slash path. */
  path: string;
  type: VariableType;
  unit: CodeUnit;
  /** Without the leading `--`. */
  cssName: string;
  swiftName: string;
  kotlinName: string;
  /** Its value in every axis's first mode. */
  base: CodeValue;
  /** The `cssName` of the variable it aliases there, if it does. */
  alias?: string;
  /** Where it differs from `base`. */
  modes: CodeModeValue[];
  /** What it's offered for (Tailwind's namespace). */
  scopes: readonly string[];
}

/** An axis with several modes, named for code. */
export interface CodeAxis {
  id: string;
  name: string;
  slug: string;
  /** A type name (`Theme`). */
  typeName: string;
  modes: { id: string; name: string; slug: string; caseName: string }[];
}

/** A text style resolved for code; `vars` are its bound parts' variables (`cssName`s). */
export interface CodeTextStyle {
  path: string;
  slug: string;
  swiftName: string;
  kotlinName: string;
  family: string;
  size: number;
  weight: number;
  /** A multiplier. */
  lineHeight: number;
  /** In px. */
  letterSpacing: number;
  vars: Partial<Record<"family" | "size" | "weight" | "lineHeight" | "letterSpacing", string>>;
}

/** A shadow style resolved for code, layers bottom to top. */
export interface CodeShadowStyle {
  path: string;
  slug: string;
  swiftName: string;
  kotlinName: string;
  layers: { x: number; y: number; blur: number; spread: number; color: string; inset: boolean }[];
}

/** The file's variables and styles as every code writer reads them. */
export interface CodeTokens {
  title: string;
  axes: CodeAxis[];
  variables: CodeVariable[];
  textStyles: CodeTextStyle[];
  shadows: CodeShadowStyle[];
}

/** Styles a product gives code writers, with `cssNameOf` naming the variables they're bound to. */
export interface CodeStyles {
  textStyles: CodeTextStyle[];
  shadows: CodeShadowStyle[];
}
