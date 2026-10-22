import type { CanvasDocument } from "../document";
import type { ServiceDef } from "./service.types";

/** One engine's services, created on first use. */
export class ServiceCache {
  private readonly services = new Map<string, unknown>();

  constructor(private readonly doc: CanvasDocument) {}

  get<T>(def: ServiceDef<T>): T {
    if (this.services.has(def.id)) return this.services.get(def.id) as T;
    const service = def.create(this.doc);
    this.services.set(def.id, service);
    return service;
  }
}
