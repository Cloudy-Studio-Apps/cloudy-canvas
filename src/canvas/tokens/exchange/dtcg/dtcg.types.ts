import type { StyleRecord, TokenCodeSyntax, TokenScope } from "../../token.types";

/** Cloudy Canvas's key in DTCG `$extensions`. */
export type DtcgExtensionKey = "app.cloudy-canvas";

/**
 * How a product's styles of one type read and write as a DTCG composite token (a text style as
 * `typography`). `write` gets `ref`, which gives a bound variable's `{reference}`; `read` gets
 * `refs`, which give the variable a reference (without braces) names and its value. Either may
 * give `null` (the style then travels only in Cloudy's extension).
 */
export interface DtcgStyleCodec {
  styleType: string;
  /** The DTCG `$type` it writes and reads. */
  dtcgType: string;
  /** The group its styles are listed under, in the `Styles` group. */
  group: string;
  write(style: StyleRecord, ref: (variableId: string) => string | null): unknown;
  read?(
    value: unknown,
    refs: DtcgRefs,
  ): { value: Record<string, unknown>; bindings: Record<string, string> } | null;
}

/** What `toDtcg` and `fromDtcg` take. */
export interface DtcgOptions {
  styles?: readonly DtcgStyleCodec[];
}

/** The file-wide part of Cloudy's extension, on the root. */
export interface DtcgRootExtension {
  version: 1;
  axes: { id: string; name: string; modes: { id: string; name: string }[] }[];
  /** `group`: its root group's key; `name`: its own name (which may hold a `.`). */
  collections: { id: string; name: string; group?: string }[];
  /** The root group holding styles, when there are any. */
  stylesGroup?: string;
  /** Styles no DTCG type fits, as records with references instead of ids. */
  styles?: DtcgStyleExtension[];
}

/** Cloudy's extension on a variable's token: what DTCG has no place for. */
export interface DtcgTokenExtension {
  id: string;
  /** Its exact path, when its segments had to change (`0.5` is written `0-5`). */
  name?: string;
  /** The axis it varies by, by name. */
  axis?: string;
  /** Its value in each mode of that axis but the first, by mode name. */
  modes?: Record<string, unknown>;
  scopes: TokenScope[];
  hidden: boolean;
  codeSyntax: TokenCodeSyntax;
  /** The surfaces it's read on, as references. */
  contrastWith?: string[];
}

/** Cloudy's extension on a style: the exact record, bindings as references. */
export interface DtcgStyleExtension {
  id: string;
  styleType: string;
  name: string;
  value: Record<string, unknown>;
  bindings: Record<string, string>;
  description: string;
}

/** The variables references name, for style codecs reading a file. */
export interface DtcgRefs {
  /** The variable's id, or `null` when it isn't in the file. */
  id(reference: string): string | null;
  /** Its value in the file's base modes (a color as `#RRGGBBAA`), `undefined` when unknown. */
  value(reference: string): string | number | boolean | undefined;
}

/** A JSON object as read from a tokens file. */
export type DtcgObject = Record<string, unknown>;

/** A token found in a DTCG tree, before references are resolved. */
export interface DtcgFound {
  path: string[];
  /** Its `$type`, or the nearest group's. */
  type: string | undefined;
  token: DtcgObject;
}
