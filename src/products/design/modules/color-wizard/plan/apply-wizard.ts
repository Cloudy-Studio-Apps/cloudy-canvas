import { asUndoStep, setBindings, type CanvasDocument, type DocumentTokens } from "@canvas";

import { buildTheme, wizardColors } from "../theme";
import { buildWizardPlan } from "./build-plan";
import type { WizardInput, WizardResult } from "./plan.types";
import { checkWizardInput } from "./check-input";
import { writePalette } from "./write-palette";
import { writeTheme } from "./write-theme";
import { writeType } from "./write-type";

/**
 * Writes what the wizard planned as one undo step: the palette (shade generators), the Theme
 * collection, the text styles, and the collected layers bound to their colors. Checks the input
 * first and throws a message people and agents can act on, before writing anything.
 */
export function applyWizard(
  doc: CanvasDocument,
  tokens: DocumentTokens,
  input: WizardInput,
): WizardResult {
  checkWizardInput(input);
  const plan = buildWizardPlan(tokens.store(), input);
  const colors = wizardColors(input.roles, input.options);
  return asUndoStep(doc, () => {
    const palette = writePalette(tokens, input.collection, colors, input.options.shades);
    const theme = buildTheme(colors, input.options, input.overrides);
    if (input.options.theme && theme.tokens.length) writeTheme(tokens, theme, palette);
    const textStyles = input.type ? writeType(doc, tokens, input.type) : 0;
    let bound = 0;
    if (input.bindFills) {
      for (const color of colors) {
        const id = palette.get(`${color.name}/500`) ?? palette.get(color.name);
        if (!id) continue;
        for (const ref of color.fills ?? []) {
          setBindings(doc, [ref.nodeId], ref.path, id);
          bound++;
        }
      }
    }
    return {
      collection: input.collection,
      created: plan.created,
      updated: plan.updated,
      textStyles,
      bound,
    };
  });
}
