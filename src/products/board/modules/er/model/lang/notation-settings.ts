import { erStandards } from "../../base/standards";
import type { ErNotation, ErNotationSettings } from "../../base/er.types";

/** The `Diagram [ … ]` settings a notation is written with, and their values. */
const VALUES = {
  cardinality: ["minmax", "ratio"],
  ratio: ["own", "across"],
  participation: ["numbers", "lines", "both"],
  isa: ["arc", "circle", "arrow"],
  arrows: ["manual", "cardinality"],
  dependency: ["marks", "none"],
} as const satisfies Partial<Record<keyof ErNotationSettings, readonly string[]>>;

/** `notation:` is the setting's first name, still read as `standard:`. */
const STANDARD_KEYS = new Set(["standard", "notation"]);

/** Whether `key` is a notation setting of the `Diagram` line. */
export function isNotationSetting(key: string): boolean {
  return STANDARD_KEYS.has(key) || key === "crowfeet" || key in VALUES;
}

/**
 * The notation `key: value` sets, or `null` when the value isn't one of the key's. Any standard id
 * is kept, installed or not (`isInstalledStandard` tells), so a plugin's comes back with it.
 */
export function readNotationSetting(key: string, value: string): ErNotation | null {
  if (STANDARD_KEYS.has(key)) return { standard: value };
  if (key === "crowfeet") {
    if (value === "on") return { crowFeet: true };
    return value === "off" ? { crowFeet: false } : null;
  }
  const values: readonly string[] | undefined = VALUES[key as keyof typeof VALUES];
  if (!values?.includes(value)) return null;
  return { [key]: value } as ErNotation;
}

/** The settings that write a notation back (`standard: elmasri`, `ratio: across`, `crowfeet: off`). */
export function notationSettings(notation: ErNotation): string[] {
  return [
    ...(notation.standard ? [`standard: ${notation.standard}`] : []),
    ...(notation.cardinality ? [`cardinality: ${notation.cardinality}`] : []),
    ...(notation.ratio ? [`ratio: ${notation.ratio}`] : []),
    ...(notation.participation ? [`participation: ${notation.participation}`] : []),
    ...(notation.isa ? [`isa: ${notation.isa}`] : []),
    ...(notation.dependency ? [`dependency: ${notation.dependency}`] : []),
    ...(notation.arrows ? [`arrows: ${notation.arrows}`] : []),
    ...(notation.crowFeet !== undefined ? [`crowfeet: ${notation.crowFeet ? "on" : "off"}`] : []),
  ];
}

/** Whether a standard id is installed (`erStandards`). */
export function isInstalledStandard(id: string): boolean {
  return erStandards.get(id) !== undefined;
}

/** Every value each notation setting takes, for completions (the standards installed now). */
export function notationValues(): Readonly<Record<string, readonly string[]>> {
  return {
    standard: erStandards.list().map((standard) => standard.id),
    ...VALUES,
    crowfeet: ["on", "off"],
  };
}
