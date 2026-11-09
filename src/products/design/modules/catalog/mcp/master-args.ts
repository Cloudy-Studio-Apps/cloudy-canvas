import { optionalString, type ToolArgs } from "@canvas";

import type { BrochureMaster } from "../brochure";
import type { DesignBrochure } from "../model";

/** The brochure's master an agent named under `key` (its id), checked. */
export function readMaster(
  brochure: DesignBrochure,
  args: ToolArgs,
  key = "master",
): BrochureMaster {
  const id = optionalString(args, key);
  if (id === undefined) throw new Error(`Give "${key}": a master's id (see catalog_brochure_get).`);
  const master = brochure.masters.list().find((item) => item.id === id);
  if (!master) {
    throw new Error(
      `The brochure "${brochure.name}" has no master "${id}" (see catalog_brochure_get).`,
    );
  }
  return master;
}

/**
 * The master pages show, as an agent gave it under `key`: `"default"` (the brochure's default,
 * `undefined`), `null` or `"none"` (none, `null`) or a master's id. `{ given: false }` when it's
 * left out.
 */
export function readPageMaster(
  brochure: DesignBrochure,
  args: ToolArgs,
  key = "master",
): { given: false } | { given: true; master: string | null | undefined } {
  if (!(key in args)) return { given: false };
  const value = args[key];
  if (value === null || value === "none") return { given: true, master: null };
  if (value === "default") return { given: true, master: undefined };
  return { given: true, master: readMaster(brochure, args, key).id };
}

/** The JSON schema of a page's master. */
export const PAGE_MASTER_SCHEMA = {
  type: ["string", "null"],
  description:
    "The master the page shows: a master's id, \"default\" (the brochure's default master) or " +
    '"none"/null (none, e.g. a full-bleed photo).',
};
