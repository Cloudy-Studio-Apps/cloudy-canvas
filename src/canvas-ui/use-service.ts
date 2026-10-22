import type { ServiceDef } from "@canvas";
import { useEngine } from "./engine-context";

/** A service of the open editor's engine (e.g. a board's database schema). */
export function useService<T>(def: ServiceDef<T>): T {
  return useEngine().service(def);
}
