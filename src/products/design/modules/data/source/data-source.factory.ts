import { createElementBase } from "@canvas";

import { DATA_SOURCE_TYPE } from "./data-source.constants";
import { DATA_SOURCE_DEFAULTS } from "./data-source.defaults";
import type { DataSourceElement, SettingValue } from "./data-source.types";

/** A source with no data yet, at `index` (only orders the list). */
export function createDataSource(
  index: string,
  init: {
    name: string;
    sourceType: string;
    settings: Record<string, SettingValue>;
    format?: string;
  },
): DataSourceElement {
  return {
    ...createElementBase(DATA_SOURCE_TYPE, { x: 0, y: 0, w: 0, h: 0 }, index),
    name: init.name,
    sourceType: init.sourceType,
    settings: init.settings,
    format: init.format ?? DATA_SOURCE_DEFAULTS.format,
    formatOptions: {},
    fields: [],
    snapshot: null,
    images: {},
  };
}
