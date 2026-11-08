import {
  remapStackBindings,
  type BindableField,
  type ElementPatch,
  type ResolvedValue,
  type TokenScope,
} from "@canvas";

import {
  PAINT_STYLE,
  paintBindable,
  paintStyleField,
  readPaintStyle,
  REGIONS_FIELD,
  regionFillsPath,
  regionIndexMap,
  regionOfFillsPath,
  setRegionFills,
  type Paint,
  type VectorNetwork,
} from "../core";
import type { VectorElement } from "./vector.types";
import { t } from "./vector.i18n";

/**
 * What variables and styles can drive on a vector's areas: each area's fills a color style (it
 * then gets fills of its own), and the colors of an area's own fills variables, as a layer's.
 */
export function areaBindable(el: VectorElement, scopes: TokenScope[]): BindableField[] {
  return el.network.regions.flatMap((region, i) => {
    const path = regionFillsPath(i);
    return [
      paintStyleField(path, t("bindable.areaFillStyle", { index: i + 1 })),
      ...(region.fills
        ? paintBindable(region.fills, path, scopes, t("bindable.areaFill", { index: i + 1 }))
        : []),
    ];
  });
}

/** What a color style on an area sets (its paints as the area's fills); `null` for other paths. */
export function areaStyleValues(
  path: string,
  value: ResolvedValue,
): Record<string, unknown> | null {
  if (regionOfFillsPath(path) === null || value.type !== "style") return null;
  const paints = value.styleType === PAINT_STYLE ? readPaintStyle(value.value) : null;
  return paints ? { [path]: paints.paints } : {};
}

/**
 * A color style on an area written as its own fills, even when it had none before (a path write
 * can't add the key); `undefined` for other paths, `null` when it can't be written.
 */
export function areaStylePatch(
  el: VectorElement,
  path: string,
  value: ResolvedValue,
): ElementPatch<VectorElement> | null | undefined {
  const region = regionOfFillsPath(path);
  const values = areaStyleValues(path, value);
  if (region === null || values === null) return undefined;
  const paints = values[path];
  if (!Array.isArray(paints) || !el.network.regions[region]) return null;
  return { network: setRegionFills(el.network, [region], paints as Paint[]) };
}

/**
 * The bindings that follow the areas when `network` replaces the vector's (an edit added or
 * removed areas), as a patch; empty when nothing moves.
 */
export function areaBindingsPatch(
  el: VectorElement,
  network: VectorNetwork,
): Partial<Pick<VectorElement, "bindings">> {
  if (!el.bindings || network.regions.length === el.network.regions.length) return {};
  const bindings = remapStackBindings(
    el.bindings,
    REGIONS_FIELD,
    regionIndexMap(el.network, network),
  );
  return JSON.stringify(bindings) === JSON.stringify(el.bindings) ? {} : { bindings };
}
