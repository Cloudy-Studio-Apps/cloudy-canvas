import { ER_NOTATION_PRESETS } from "../../base/er-notation";
import type { ErNotation, ErNotationSettings } from "../../base/er.types";

/** The `Diagram [ … ]` settings a notation is written with, and their values. */
const VALUES = {
  ratio: ["own", "across"],
  participation: ["numbers", "lines", "both"],
  isa: ["arc", "circle"],
} as const satisfies Partial<Record<keyof ErNotationSettings, readonly string[]>>;

/** Whether `key` is a notation setting of the `Diagram` line. */
export function isNotationSetting(key: string): boolean {
  return key === "notation" || key === "crowfeet" || key in VALUES;
}

/** The notation `key: value` sets, or `null` when the value isn't one of the key's. */
export function readNotationSetting(key: string, value: string): ErNotation | null {
  if (key === "notation") return value in ER_NOTATION_PRESETS ? { preset: value as "chen" } : null;
  if (key === "crowfeet") {
    if (value === "on") return { crowFeet: true };
    return value === "off" ? { crowFeet: false } : null;
  }
  const values: readonly string[] | undefined = VALUES[key as keyof typeof VALUES];
  if (!values?.includes(value)) return null;
  return { [key]: value } as ErNotation;
}

/** The settings that write a notation back (`notation: chen`, `ratio: across`, `crowfeet: off`). */
export function notationSettings(notation: ErNotation): string[] {
  return [
    ...(notation.preset ? [`notation: ${notation.preset}`] : []),
    ...(notation.ratio ? [`ratio: ${notation.ratio}`] : []),
    ...(notation.participation ? [`participation: ${notation.participation}`] : []),
    ...(notation.isa ? [`isa: ${notation.isa}`] : []),
    ...(notation.crowFeet !== undefined ? [`crowfeet: ${notation.crowFeet ? "on" : "off"}`] : []),
  ];
}
