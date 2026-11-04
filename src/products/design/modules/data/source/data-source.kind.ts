import { ElementKind } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { DATA_SOURCE_TYPE } from "./data-source.constants";
import { DATA_SOURCE_DEFAULTS } from "./data-source.defaults";
import type { DataSourceDefaults, DataSourceElement } from "./data-source.types";

/** A data source is a record, not a layer: never drawn or hit, and never on a page's canvas. */
export class DataSourceKind extends ElementKind<DataSourceElement, DesignToolOptions> {
  readonly type = DATA_SOURCE_TYPE;
  readonly label = "Data source";
  readonly description = "Where some data comes from, how it is read and the last copy of it.";
  override readonly defaults: DataSourceDefaults = DATA_SOURCE_DEFAULTS;
  override readonly creatable = false;
  override readonly boxed = false;

  draw(): void {}

  override hitTest(): boolean {
    return false;
  }

  /** Its snapshot and the images its data names, so they stay in the file and copy with it. */
  override assets({ snapshot, images }: DataSourceElement): string[] {
    return [...(snapshot ? [snapshot.assetId] : []), ...Object.values(images ?? {})];
  }

  override fillDefaults(el: DataSourceElement): DataSourceElement {
    return {
      ...el,
      name: el.name || DATA_SOURCE_DEFAULTS.name,
      sourceType: el.sourceType ?? "",
      settings: el.settings ?? {},
      format: el.format ?? DATA_SOURCE_DEFAULTS.format,
      formatOptions: el.formatOptions ?? {},
      fields: el.fields ?? [],
      snapshot: el.snapshot ?? null,
      images: el.images ?? {},
    };
  }
}
