import { definePoint } from "@shared/core";

import type {
  DataFormat,
  DataLocaleProvider,
  DataPreviewSetter,
  DataScopeProvider,
  DataSourceType,
} from "./data.points.types";

/** Where data comes from, keyed by id: the built-ins, and any a plugin adds. */
export const dataSourceTypes = definePoint<DataSourceType>("design.data.sourceTypes", {
  keyOf: (t) => t.id,
});

/** How raw data becomes rows, keyed by id: the built-ins, and any a plugin adds. */
export const dataFormats = definePoint<DataFormat>("design.data.formats", {
  keyOf: (f) => f.id,
});

/**
 * The loops around a top-level frame that another module repeats (a brochure's pages): their rows
 * are layered over the sources for every layer in the frame, bindings and card repeaters alike.
 */
export const dataScopeProviders = definePoint<DataScopeProvider>("design.data.scopeProviders");

/** The language data is written in inside a top-level layer (a brochure's), first answer wins. */
export const dataLocaleProviders = definePoint<DataLocaleProvider>("design.data.localeProviders");

/**
 * Where a loop another module puts around a layer comes from, and its preview row's stepper (a
 * brochure's section and page repeats), for the In scope view; the first answer wins.
 */
export const dataPreviewSetters = definePoint<DataPreviewSetter>("design.data.previewSetters");
