import type { CanvasDocument, DocumentTokens } from "@canvas";

import { TEXT_STYLE } from "../../text";
import { createTypeScale, DEFAULT_TYPE_SCALE, styleGroupOf } from "../../variables";
import { wizardTypeSteps, type WizardType } from "../type";
import { collectionNamed } from "./collection-named";
import { TYPE_GROUP, TYPOGRAPHY_COLLECTION } from "./constants";

/**
 * Writes the text styles: the variables' type scale in the Typography collection (sizes kept
 * linked to the scale) set in the body font, then the headings set in theirs. A file that has the
 * scale's styles keeps them and only gets the fonts. Returns how many styles it wrote.
 */
export function writeType(doc: CanvasDocument, tokens: DocumentTokens, type: WizardType): number {
  const group = styleGroupOf(TYPE_GROUP);
  const steps = wizardTypeSteps(type);
  const named = (step: string) =>
    tokens
      .store()
      .styles(TEXT_STYLE)
      .find((s) => s.name === `${group}/${step}`);
  if (!steps.some((step) => named(step.name))) {
    createTypeScale(doc, tokens, {
      ...DEFAULT_TYPE_SCALE,
      base: type.base,
      ratio: type.ratio,
      collection: collectionNamed(tokens, TYPOGRAPHY_COLLECTION).id,
      group: TYPE_GROUP,
      font: { name: type.body },
    });
  }
  let written = 0;
  for (const step of steps) {
    const style = named(step.name);
    if (!style) continue;
    written++;
    if (style.value.fontFamily !== step.font) {
      tokens.updateStyle(style.id, { value: { ...style.value, fontFamily: step.font } });
    }
  }
  return written;
}
