import { normalizeColorHex } from "../color";
import type { WizardInput } from "./plan.types";

/** Throws, naming what's wrong, when the wizard can't write `input`. */
export function checkWizardInput(input: WizardInput): void {
  if (!input.collection.trim()) throw new Error("The palette's collection needs a name.");
  const roles = input.roles.filter((r) => r.include);
  if (!roles.length) throw new Error("Include at least one color.");
  const names = new Set<string>();
  for (const role of roles) {
    const name = role.name.trim();
    if (!name) throw new Error("Every included color needs a role name.");
    if (names.has(name)) throw new Error(`Two colors are named "${name}"; rename one.`);
    if (!normalizeColorHex(role.hex)) throw new Error(`"${role.hex}" isn't a color (#RRGGBB).`);
    names.add(name);
  }
  if (input.type && (input.type.base < 8 || input.type.base > 32)) {
    throw new Error("The body size must be between 8 and 32 px.");
  }
  if (input.type && (input.type.ratio < 1.05 || input.type.ratio > 2)) {
    throw new Error("The type scale's ratio must be between 1.05 and 2.");
  }
}
