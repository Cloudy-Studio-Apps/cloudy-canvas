import type { PageInfo } from "../numbering/page-numbers.types";
import type { ContentsEntry } from "./contents-entries.types";
import type { PageRefs } from "./page-refs.types";

/**
 * What marks a layer as a master layer's copy on a page (its `catalogCopy` field): the brochure
 * that stamped it, the master and the master layer it copies. The catalog keeps it in step and
 * locked; other modules don't know the field.
 */
export interface PageItemTag {
  brochure: string;
  master: string;
  source: string;
  /** The half of a spread frame it's on (a frame holding two pages); left out on a single page. */
  half?: "left" | "right";
}

/** What the tokens of a page item's text read on one page. */
export interface TemplateContext {
  info: PageInfo;
  /** How many pages are counted. */
  pages: number;
  /** The brochure's name. */
  title: string;
  /** Today, written out in the app's language. */
  date: string;
  /** The contents (`contentsEntries`): `{toc}` writes a line per entry. */
  contents: readonly ContentsEntry[];
  /** What `{page:Name}` names (`pageRefs`). */
  refs: PageRefs;
}
