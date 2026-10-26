import { geoVariants } from "./variants/variant.registry";

/**
 * What agents may give for a geo shape in `create_shapes` (its fields, merged into the schema with
 * every kind's). `kind` is a getter so it lists the variants registered when an agent asks
 * (plugins' too).
 */
export const GEO_SPEC_PROPERTIES = {
  get kind() {
    return { enum: geoVariants.keys(), description: "Geo shape kind." };
  },
  fill: { type: "string", description: 'Geo fill, or "transparent".' },
  stroke: { type: "string", description: 'Geo outline, or "transparent".' },
};
