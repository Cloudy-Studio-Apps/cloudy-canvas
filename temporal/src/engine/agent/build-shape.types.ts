import type { Shape } from "../document";

/** Finds a shape by id, or by the `key` of a shape created earlier in the same call. */
export type ShapeLookup = (ref: string) => Shape | undefined;
