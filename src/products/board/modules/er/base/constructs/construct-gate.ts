import type { ErStandardDefinition } from "../standards/er-standard.types";
import type { ErConstructDefinition, ErConstructGate } from "./er-construct.types";
import { erConstructs } from "./er-construct-registry";

/** Whether the standard lets a diagram use the construct (every one it doesn't forbid). */
export function erAllows(standard: ErStandardDefinition, construct: string): boolean {
  return !standard.forbids?.includes(construct);
}

/** The installed constructs the standard forbids (ids that aren't installed are ignored). */
export function forbiddenConstructs(standard: ErStandardDefinition): ErConstructDefinition[] {
  return (standard.forbids ?? []).flatMap((id) => erConstructs.get(id) ?? []);
}

/** What the standard lets the editor add, with the reason for what it doesn't. */
export function constructGate(standard: ErStandardDefinition): ErConstructGate {
  return {
    allows: (construct) => erAllows(standard, construct),
    reason: (construct) =>
      erAllows(standard, construct)
        ? ""
        : `${erConstructs.get(construct)?.label ?? construct} aren't part of ${standard.label}`,
  };
}

/** A gate that allows everything (no diagram shown yet, or code without a standard). */
export const OPEN_GATE: ErConstructGate = { allows: () => true, reason: () => "" };
