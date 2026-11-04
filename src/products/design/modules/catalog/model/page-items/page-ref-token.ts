const PAGE_REF = /(?<!\{)\{page:([^}]*)\}/g;

/** The names a template's `{page:Name}` tokens point to, in order (`{{page:…}` is literal text). */
export function pageRefNames(template: string): string[] {
  return [...template.matchAll(PAGE_REF)].map((match) => match[1] ?? "");
}
