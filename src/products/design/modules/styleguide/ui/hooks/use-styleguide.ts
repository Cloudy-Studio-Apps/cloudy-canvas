import { useMemo, useSyncExternalStore } from "react";

import { useEditorModules, useService } from "@canvas-ui";
import {
  DESIGN_STYLEGUIDE,
  styleguideCategories,
  styleguideTemplates,
  type DesignStyleguide,
  type StyleguideCategory,
  type StyleguideOutlineEntry,
  type StyleguideTemplate,
} from "@design";

/** The Design system service, its version (bumps on changes it reports) and the contributed parts. */
export function useStyleguide(): {
  styleguide: DesignStyleguide;
  version: number;
  categories: readonly StyleguideCategory[];
  templates: readonly StyleguideTemplate[];
} {
  const styleguide = useService(DESIGN_STYLEGUIDE);
  const version = useSyncExternalStore(styleguide.subscribe, styleguide.getVersion);
  const { host } = useEditorModules();
  const categories = useMemo(() => host.get(styleguideCategories), [host]);
  const templates = useMemo(() => host.get(styleguideTemplates), [host]);
  return { styleguide, version, categories, templates };
}

/** The categories in the view's order with their groups, as they change. */
export function useStyleguideOutline(): StyleguideOutlineEntry[] {
  const { styleguide, version, categories } = useStyleguide();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- read again when the version bumps
  return useMemo(() => styleguide.outline(categories), [styleguide, categories, version]);
}
