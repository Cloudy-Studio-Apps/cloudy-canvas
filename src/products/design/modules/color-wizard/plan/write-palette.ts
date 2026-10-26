import { DEFAULT_SHADE_SETTINGS, DEFAULT_VALUE, type DocumentTokens } from "@canvas";

import type { WizardColor } from "../theme";
import { collectionNamed } from "./collection-named";

/**
 * Writes the palette: each color's shades as a shade generator (kept linked to the color, the
 * same in every mode; an existing one for the group is updated), or one variable per color
 * without shades. Returns the variables written, by name (`primary/500`, or `primary`).
 */
export function writePalette(
  tokens: DocumentTokens,
  collection: string,
  colors: readonly WizardColor[],
  shades: boolean,
): Map<string, string> {
  const { id: collectionId } = collectionNamed(tokens, collection);
  const ids = new Map<string, string>();
  for (const color of colors) {
    const value = { color: `${color.hex}FF` };
    if (shades) {
      const generator = tokens.saveGenerator({
        ...DEFAULT_SHADE_SETTINGS,
        other: "same",
        collectionId,
        group: color.name,
        baseVar: null,
        baseColor: value.color,
      });
      for (const v of tokens.store().variables(collectionId)) {
        if (v.generatorId === generator.id) ids.set(v.name, v.id);
      }
      continue;
    }
    const known = tokens.store().byPath(collectionId, color.name);
    if (known) tokens.setValue(known.id, DEFAULT_VALUE, value);
    const id =
      known?.id ??
      tokens.createVariable({ collectionId, name: color.name, type: "color", value }).id;
    ids.set(color.name, id);
  }
  return ids;
}
