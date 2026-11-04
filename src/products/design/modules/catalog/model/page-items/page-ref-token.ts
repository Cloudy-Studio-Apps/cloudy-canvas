const PAGE_REF = /(?<!\{)\{page:([^}]*)\}/g;
const FIRST_PAGE_REF = /(?<!\{)\{page:[^}]*\}/;

/** The names a template's `{page:Name}` tokens point to, in order (`{{page:…}` is literal text). */
export function pageRefNames(template: string): string[] {
  return [...template.matchAll(PAGE_REF)].map((match) => match[1] ?? "");
}

/** The name a template's first `{page:Name}` points to, `null` when it has none. */
export function readPageRef(template: string): string | null {
  return pageRefNames(template)[0] ?? null;
}

/** Whether a section or page name can be written in a `{page:Name}` (a `}` would end it). */
export const canReferTo = (name: string) => name.trim() !== "" && !name.includes("}");

/** The template with its first `{page:…}` pointing to `name`, or one added at its end. */
export function withPageRef(template: string, name: string): string {
  const token = `{page:${name}}`;
  return FIRST_PAGE_REF.test(template)
    ? template.replace(FIRST_PAGE_REF, () => token)
    : `${template} ${token}`;
}
