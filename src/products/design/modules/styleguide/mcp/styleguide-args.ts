import { optionalRecord, optionalString, type ToolArgs } from "@canvas";

import { templateOptions } from "../sheet";
import type { StyleguideCategory, StyleguideTemplate, TemplateOptions } from "../styleguide.types";
import type { StyleguideToolSources } from "./styleguide-mcp.types";

/** A category an agent named (by id); throws listing them otherwise. */
export function readCategory(sources: StyleguideToolSources, args: ToolArgs): StyleguideCategory {
  const id = optionalString(args, "category");
  const category = sources.categories().find((c) => c.id === id);
  if (!category) {
    const ids = sources
      .categories()
      .map((c) => c.id)
      .join(", ");
    throw new Error(`"category" is one of: ${ids}. Call get_design_system for their groups.`);
  }
  return category;
}

/**
 * The template (and its options) an agent named for a category, or `undefined` without
 * `template`; unknown templates and options throw, listing the valid ones.
 */
export function readTemplate(
  sources: StyleguideToolSources,
  category: StyleguideCategory,
  args: ToolArgs,
): { template: StyleguideTemplate; options: TemplateOptions } | undefined {
  const id = optionalString(args, "template");
  if (id === undefined) return undefined;
  const own = sources.templates().filter((t) => t.category === category.id);
  const template = own.find((t) => t.id === id);
  if (!template) {
    throw new Error(
      `"template" for ${category.id} is one of: ${own.map((t) => t.id).join(", ") || "none"}.`,
    );
  }
  const given = optionalRecord(args, "options") ?? {};
  const unknown = Object.keys(given).filter((key) => !template.options.some((o) => o.id === key));
  if (unknown.length > 0) {
    const valid = template.options.map((o) => o.id).join(", ") || "none";
    throw new Error(`Unknown options for ${template.id}: ${unknown.join(", ")} (valid: ${valid}).`);
  }
  return { template, options: templateOptions(template, given) };
}

/** A group id an agent named, checked against the category's groups. */
export function readGroup(
  category: StyleguideCategory,
  groups: readonly { id: string }[],
  args: ToolArgs,
): string | undefined {
  const group = optionalString(args, "group");
  if (group !== undefined && !groups.some((g) => g.id === group)) {
    throw new Error(
      `${category.id} has no group "${group}". Call get_design_system for its groups.`,
    );
  }
  return group;
}
