import type { SectionParents } from "./sections.types";

const SECTION_TOKEN = /\{section(?::(all|\d+))?\}/g;

/** How many parents a `{section:…}` token's option reads (`all`, a number, none: 0). */
export function readSectionParents(option: string | undefined): SectionParents {
  if (option === "all") return "all";
  return option ? Number(option) : 0;
}

/** The `{section}` token that reads `parents`. */
export function sectionToken(parents: SectionParents): string {
  return parents === 0 ? "{section}" : `{section:${parents}}`;
}

/** How a template's first `{section}` token reads its parents, `null` when it has none. */
export function templateSectionParents(template: string): SectionParents | null {
  const match = new RegExp(SECTION_TOKEN.source).exec(template);
  return match ? readSectionParents(match[1]) : null;
}

/** The template with every `{section}` token reading `parents`. */
export function withSectionParents(template: string, parents: SectionParents): string {
  return template.replace(SECTION_TOKEN, sectionToken(parents));
}
