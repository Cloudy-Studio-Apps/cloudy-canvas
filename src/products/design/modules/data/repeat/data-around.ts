import type { ModuleHost } from "@shared/core";

import { dataFieldRenames, dataLocaleProviders, dataScopeProviders } from "../data.points";
import type { DataAround } from "../data.points.types";

const NONE: DataAround = { scopes: [], locales: [], fieldRenames: [] };

let read: () => DataAround = () => NONE;

/**
 * Hands the data module the `dataScopeProviders`, `dataLocaleProviders` and `dataFieldRenames` entries, read live from
 * the design's module host (`register` calls it once per host, so a host composed again replaces
 * it). Engine code asking for a layer's scope (`dataScopes`, `scopeAt`) has only the document.
 */
export function readAroundFrom(host: ModuleHost): void {
  read = () => ({
    scopes: host.get(dataScopeProviders),
    locales: host.get(dataLocaleProviders),
    fieldRenames: host.get(dataFieldRenames),
  });
}

/** The providers' entries now; none until the data module is registered. */
export function dataAround(): DataAround {
  return read();
}
