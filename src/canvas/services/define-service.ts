import type { CanvasDocument } from "../document";
import type { ServiceDef } from "./service.types";

/** A new engine service; export it next to the facade it creates. */
export function defineService<T>(id: string, create: (doc: CanvasDocument) => T): ServiceDef<T> {
  return { id, create };
}
