import { Registry } from "../../../utils/registry";
import { Cylinder } from "./cylinder.variant";
import { Diamond } from "./diamond.variant";
import { Ellipse } from "./ellipse.variant";
import type { GeoVariant } from "./geo.variant";
import { Parallelogram } from "./parallelogram.variant";
import { Rectangle } from "./rectangle.variant";
import { Rounded } from "./rounded.variant";
import { Star } from "./star.variant";
import { Triangle } from "./triangle.variant";

/**
 * Every geo variant, keyed by id, in the order the shape picker shows them. Plugins add theirs
 * with `geoVariants.register(new MyVariant())`.
 */
export const geoVariants = new Registry<GeoVariant>("geo variant", (variant) => variant.id);
const rectangle = new Rectangle();
geoVariants.register(rectangle);
geoVariants.register(new Rounded());
geoVariants.register(new Ellipse());
geoVariants.register(new Diamond());
geoVariants.register(new Triangle());
geoVariants.register(new Parallelogram());
geoVariants.register(new Cylinder());
geoVariants.register(new Star());

/** The variant to draw an element with. Unknown ids (a missing plugin) are drawn as rectangles. */
export function variantOf(id: string): GeoVariant {
  return geoVariants.get(id) ?? rectangle;
}
