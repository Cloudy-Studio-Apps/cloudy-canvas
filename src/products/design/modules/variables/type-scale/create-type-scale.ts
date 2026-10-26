import {
  normalizeTokenPath,
  resolveVariable,
  type CanvasDocument,
  type DocumentTokens,
} from "@canvas";

import { TEXT_STYLE } from "../../text";
import { styleGroupOf, typeScaleSteps } from "./type-scale";
import type { CreatedTypeScale, TypeScaleSettings } from "./type-scale.types";

/**
 * Makes a type scale as one undo step: a number scale of font sizes (`group/<step>`, scope
 * font-size: editing its base or ratio regenerates them) and a text style per step whose size is
 * bound to its step (and whose font to the font variable, if one is given), so the styles and
 * every text using them follow the scale. Throws when the group's styles already exist.
 */
export function createTypeScale(
  doc: CanvasDocument,
  tokens: DocumentTokens,
  settings: TypeScaleSettings,
): CreatedTypeScale {
  const group = normalizeTokenPath(settings.group) || "type";
  const styleGroup = styleGroupOf(group);
  const steps = typeScaleSteps({ ...settings, group });
  const taken = new Set(
    tokens
      .store()
      .styles(TEXT_STYLE)
      .map((s) => s.name),
  );
  if (steps.some((step) => taken.has(`${styleGroup}/${step.name}`))) {
    throw new Error(`Type scale "${styleGroup}" already exists: pick another group.`);
  }
  const fontVariable = "variable" in settings.font ? settings.font.variable : null;
  const resolved = fontVariable ? resolveVariable(tokens.store(), fontVariable, {}) : null;
  const family =
    "name" in settings.font
      ? settings.font.name
      : resolved?.type === "string" && resolved.string
        ? resolved.string
        : "Inter";
  let result!: CreatedTypeScale;
  doc.checkpoint();
  doc.batch(() => {
    const scale = tokens.saveScale({
      collectionId: settings.collection,
      group,
      baseVar: null,
      baseValue: settings.base,
      scopes: ["font-size"],
      ratio: settings.ratio,
      below: settings.below,
      above: settings.above,
      names: settings.names,
      round: settings.round,
    });
    const sizes = new Map(
      tokens
        .store()
        .variables(settings.collection)
        .filter((v) => v.generatorId === scale.id)
        .map((v) => [v.name.slice(v.name.lastIndexOf("/") + 1), v.id]),
    );
    const styles = steps.map(
      (step) =>
        tokens.createStyle({
          styleType: TEXT_STYLE,
          name: `${styleGroup}/${step.name}`,
          value: {
            fontFamily: family,
            fontSize: step.size,
            fontWeight: step.weight,
            fontStyle: "normal",
            lineHeight: step.lineHeight,
            letterSpacing: 0,
            textDecoration: "none",
          },
          bindings: {
            ...(sizes.get(step.name) ? { fontSize: sizes.get(step.name)! } : {}),
            ...(fontVariable ? { fontFamily: fontVariable } : {}),
          },
        }).id,
    );
    result = { scale: scale.id, styles };
  });
  return result;
}
