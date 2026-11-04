/** Where a `{page:Name}` points: its page's number as written, and its side in the layout. */
export interface PageRefTarget {
  label: string;
  side: number;
}

/** Finds what a `{page:Name}` names: a section, else a page; `null` when nothing is called that. */
export type PageRefs = (name: string) => PageRefTarget | null;
