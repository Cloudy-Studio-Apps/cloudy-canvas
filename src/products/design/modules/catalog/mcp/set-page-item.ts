import { optionalString, type ElementPatch, type ToolArgs } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { isText } from "../../text";
import {
  canReferTo,
  pageItemTag,
  pageItemTemplate,
  pageNumbers,
  pageRefNames,
  pageRefs,
  withPageRef,
  type DesignBrochure,
} from "../model";
import { BROCHURE_SCHEMA } from "./brochure-args";

export const SET_PAGE_ITEM_DESCRIPTION =
  "Changes a page item (`node`: a text add_page_item made, listed in get_brochure_page's " +
  "`pageItems`, on a page or a master) in one undo step: `template` rewrites its words with " +
  'their tokens ({page}, {pages}, {title}, {section}, {date}, {toc}, {page:Name}; e.g. "Page ' +
  '{page} of {pages}"), and `target` points its page reference ({page:…}) at the section or ' +
  "page called that (added at the end when it has none). Writing a page item's `text` with " +
  "update_nodes doesn't last: the brochure writes it again from the template. A master's " +
  "locked copy on a page can't be changed: change the master layer it copies (`fromMaster`). " +
  "Returns the template, the text it now shows and any {page:Name} that names no section or " +
  "page (`unmatched`).";

export const SET_PAGE_ITEM_SCHEMA = {
  type: "object",
  required: ["brochure", "node"],
  properties: {
    node: { type: "string", description: "The page item's id." },
    template: { type: "string", description: "Its new words, with tokens." },
    target: {
      type: "string",
      description: "The name of the section or page its page reference points to.",
    },
    brochure: BROCHURE_SCHEMA,
  },
};

/** `set_page_item`: checks every argument, then writes the template (see the description). */
export function setPageItem(engine: DesignWorkspace, brochure: DesignBrochure, args: ToolArgs) {
  const id = optionalString(args, "node");
  const el = id === undefined ? undefined : engine.doc.get(id);
  const current = pageItemTemplate(el);
  if (!id || !el || !isText(el) || current === null) {
    throw new Error('"node" must be a page item (see get_brochure_page\'s pageItems).');
  }
  const tag = pageItemTag(el);
  if (tag) {
    throw new Error(`"${id}" is a master's copy: change the master layer "${tag.source}".`);
  }
  if (el.pageId !== brochure.page) {
    throw new Error(`"${id}" isn't on this brochure's design page.`);
  }
  const template = optionalString(args, "template");
  const target = optionalString(args, "target");
  if (template === undefined && target === undefined) {
    throw new Error('Give "template", "target" or both.');
  }
  if (template !== undefined && template.trim() === "") {
    throw new Error('"template" can\'t be empty.');
  }
  const layout = brochure.layout();
  const record = brochure.record();
  const refs = pageRefs(layout, record ? pageNumbers(layout, record) : []);
  if (target !== undefined && (!canReferTo(target) || !refs(target))) {
    throw new Error(`"${target}" isn't a section or page of this brochure (get_brochure).`);
  }
  let next = template ?? current;
  if (target !== undefined) next = withPageRef(next, target);
  return {
    next,
    unmatched: pageRefNames(next).filter((name) => !refs(name)),
    patch: { catalogText: next } as ElementPatch,
  };
}
