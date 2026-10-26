import { useMemo } from "react";

import {
  templateChoice,
  type StyleguideCategory,
  type TokenSheet,
  type StyleguideTemplate,
  type TemplateOptions,
} from "@design";
import { useStyleguide } from "./use-styleguide";

/**
 * The template a category, a group or an element is drawn with and its options, as configured
 * (`sheet` gives an element's own; without one, the view's choices).
 */
export function useTemplateChoice(
  category: StyleguideCategory | undefined,
  group: string | undefined,
  sheet: Pick<TokenSheet, "template" | "options"> = { template: null, options: null },
): { template: StyleguideTemplate; options: TemplateOptions } | null {
  const { styleguide, version, templates } = useStyleguide();
  const { template, options } = sheet;
  return useMemo(() => {
    if (!category) return null;
    const lookup = (id: string) => templates.find((t) => t.id === id);
    return templateChoice(
      styleguide.settings(),
      { template, options },
      group ?? "",
      category,
      lookup,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read again when the version bumps
  }, [styleguide, category, group, template, options, templates, version]);
}
