import { useMemo, useSyncExternalStore } from "react";

import { TokenStore } from "@canvas";
import { buildSheet } from "../../sheet/build-sheet";
import { sheetContext } from "../../sheet/sheet-context";
import type {
  GeneratedSpec,
  StyleguideCategory,
  StyleguideTemplate,
  TemplateOptions,
} from "../../styleguide.types";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** How many of a category's groups a thumbnail shows (it stays cheap). */
const PREVIEW_GROUPS = 2;

/**
 * What a template makes of a category's (or one group's) tokens, as specs for a thumbnail: built
 * with the live store, again when the tokens change.
 */
export function useSheetPreview(
  category: StyleguideCategory,
  group: string | undefined,
  template: StyleguideTemplate,
  options: TemplateOptions,
): GeneratedSpec[] {
  const engine = useDesignEngine();
  const doc = engine.doc;
  const version = useSyncExternalStore(
    (listener) => doc.observeTokens(listener),
    () => doc.tokensVersion(),
  );
  return useMemo(() => {
    const store = TokenStore.of(doc);
    const groups = category.groups(store, doc);
    const shown = group ? groups.filter((g) => g.id === group) : groups.slice(0, PREVIEW_GROUPS);
    const specs = buildSheet({
      sheet: {
        category: category.id,
        template: template.id,
        options: { ...options },
        modeView: "current",
        hash: "",
        ...(group ? { group } : {}),
      },
      category,
      groups: shown,
      settings: { order: [], hidden: [], choices: {}, modeView: "current" },
      hiddenGroups: new Set(),
      modeView: "current",
      templates: (id) => (id === template.id ? template : undefined),
      context: sheetContext(doc, store),
      // The file's modes (each axis's current one).
      modes: {},
    });
    // The category's big heading isn't the template: thumbnails leave it out for the colors.
    return specs.filter((spec) => spec.key !== "heading");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- built again when the tokens change
  }, [doc, category, group, template, options, version]);
}
