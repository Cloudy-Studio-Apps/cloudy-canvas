import type { GeoVariantId } from "../geo.types";
import { Cylinder } from "./cylinder";
import { Diamond } from "./diamond";
import { Ellipse } from "./ellipse";
import type { GeoVariant } from "./geo-variant";
import { Parallelogram } from "./parallelogram";
import { Rectangle } from "./rectangle";
import { Rounded } from "./rounded";
import { Star } from "./star";
import { Triangle } from "./triangle";

/** One variant per id. Adding a variant means adding its id to `GeoVariantId` and its class here. */
export const GEO_VARIANTS: { readonly [K in GeoVariantId]: GeoVariant } = {
  rectangle: new Rectangle(),
  rounded: new Rounded(),
  ellipse: new Ellipse(),
  diamond: new Diamond(),
  triangle: new Triangle(),
  parallelogram: new Parallelogram(),
  cylinder: new Cylinder(),
  star: new Star(),
};

/** Every variant id, in the order the shape picker shows them. */
export const GEO_VARIANT_IDS = Object.keys(GEO_VARIANTS) as readonly GeoVariantId[];

export function isGeoVariantId(value: unknown): value is GeoVariantId {
  return typeof value === "string" && Object.hasOwn(GEO_VARIANTS, value);
}
