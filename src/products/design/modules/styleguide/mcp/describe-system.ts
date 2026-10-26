import { DESIGN_PAGES } from "../../pages";
import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_STYLEGUIDE } from "../model";
import { groupKey, isSheet, templateChoice } from "../sheet";
import type { StyleguideToolSources } from "./styleguide-mcp.types";

/** The Design system as agents read it: its sections, the templates, and the live elements. */
export function describeSystem(engine: DesignWorkspace, sources: StyleguideToolSources) {
  const styleguide = engine.service(DESIGN_STYLEGUIDE);
  const settings = styleguide.settings();
  const templates = sources.templates();
  const lookup = (id: string) => templates.find((t) => t.id === id);
  const pages = engine.service(DESIGN_PAGES).pages();
  return {
    systemPage: styleguide.page()?.id ?? null,
    modeView: settings.modeView,
    categories: styleguide.outline(sources.categories()).map((entry) => {
      const choice = templateChoice(
        settings,
        { template: null, options: null },
        "",
        entry.category,
        lookup,
      );
      return {
        id: entry.category.id,
        label: entry.category.label,
        hidden: entry.hidden,
        template: choice?.template.id ?? null,
        options: choice?.options ?? {},
        groups: entry.groups.map((group) => {
          const own = templateChoice(
            settings,
            { template: null, options: null },
            group.id,
            entry.category,
            lookup,
          );
          return {
            id: group.id,
            title: group.title,
            items: group.items.length,
            hidden: settings.hidden.includes(groupKey(entry.category.id, group.id)),
            template: own?.template.id ?? null,
          };
        }),
      };
    }),
    templates: templates.map((template) => ({
      id: template.id,
      category: template.category,
      label: template.label,
      description: template.description,
      options: template.options,
    })),
    elements: engine.doc
      .all()
      .filter(isSheet)
      .filter((sheet) => pages.some((page) => page.id === sheet.pageId))
      .map((sheet) => ({
        id: sheet.id,
        name: sheet.name,
        page: sheet.pageId,
        category: sheet.sheet.category,
        ...(sheet.sheet.group ? { group: sheet.sheet.group } : {}),
        template: sheet.sheet.template,
        options: sheet.sheet.options,
        modeView: sheet.sheet.modeView,
      })),
  };
}
