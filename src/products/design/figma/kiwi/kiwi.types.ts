/** How a definition is encoded: an enum value, fields in order, or numbered optional fields. */
export type KiwiKind = "enum" | "struct" | "message";

export interface KiwiField {
  name: string;
  /** A built-in type (`uint`, `string`, …) or another definition's name; `null` in enums. */
  type: string | null;
  isArray: boolean;
  /** The enum value, or the message field's number. */
  value: number;
}

export interface KiwiDefinition {
  name: string;
  kind: KiwiKind;
  fields: KiwiField[];
}

/** A Kiwi schema, as stored in the file it describes. */
export interface KiwiSchema {
  definitions: ReadonlyMap<string, KiwiDefinition>;
}

/** A decoded struct or message: its fields by name (messages leave out the ones not given). */
export type KiwiRecord = { [field: string]: KiwiValue };

export type KiwiValue = boolean | number | bigint | string | Uint8Array | KiwiRecord | KiwiValue[];
