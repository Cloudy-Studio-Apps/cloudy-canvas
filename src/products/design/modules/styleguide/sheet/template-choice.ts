import type {
  StyleguideCategory,
  StyleguideTemplate,
  TemplateOptions,
  TemplateOptionSpec,
} from "../styleguide.types";
import type { StyleguideSettings, TemplateChoice, TokenSheet } from "./sheet.types";

/** The key a group's choice and visibility are stored under. */
export function groupKey(category: string, groupId: string): string {
  return `${category}:${groupId}`;
}

/** An option's stored value if it's valid for the option, else its default. */
function optionValue(spec: TemplateOptionSpec, value: unknown): unknown {
  switch (spec.type) {
    case "boolean":
      return typeof value === "boolean" ? value : spec.default;
    case "number":
      return typeof value === "number" && Number.isFinite(value)
        ? Math.min(spec.max, Math.max(spec.min, value))
        : spec.default;
    case "select":
      return spec.choices.some((choice) => choice.value === value) ? value : spec.default;
    case "font":
      return typeof value === "string" && value.trim() ? value : spec.default;
  }
}

/** Every option the template declares, from what's stored where valid, else its default. */
export function templateOptions(
  template: StyleguideTemplate,
  stored: Readonly<Record<string, unknown>> | null | undefined,
): TemplateOptions {
  return Object.fromEntries(
    template.options.map((spec) => [spec.id, optionValue(spec, stored?.[spec.id])]),
  );
}

/**
 * The template a group of a sheet is drawn with, and its options: the element's own, else the
 * group's override, else the category's default, else the category's built-in default. Stored ids
 * that are gone or of another category are passed over. `null` when none exists.
 */
export function templateChoice(
  settings: StyleguideSettings,
  sheet: Pick<TokenSheet, "template" | "options">,
  groupId: string,
  category: StyleguideCategory,
  templates: (id: string) => StyleguideTemplate | undefined,
): { template: StyleguideTemplate; options: TemplateOptions } | null {
  const valid = (id: string | null | undefined) => {
    const template = id ? templates(id) : undefined;
    return template?.category === category.id ? template : undefined;
  };
  const candidates: (TemplateChoice | null)[] = [
    sheet.template ? { template: sheet.template, options: sheet.options ?? {} } : null,
    settings.choices[groupKey(category.id, groupId)] ?? null,
    settings.choices[category.id] ?? null,
    { template: category.defaultTemplate, options: {} },
  ];
  for (const choice of candidates) {
    const template = valid(choice?.template);
    if (template) return { template, options: templateOptions(template, choice?.options) };
  }
  return null;
}
