import { defineService } from "@canvas";

import type { ErConnectSource, ErQuickAddOption, ErQuickAddRequest } from "./er-connect.types";
import { ErPrompt } from "./er-prompt";

/**
 * A connect dot dropped on empty board, waiting for what to create there (the quick-add menu).
 * One per engine: `ctx.service(ER_QUICK_ADD)`, `useService(ER_QUICK_ADD)`.
 */
export const ER_QUICK_ADD = defineService(
  "board.erQuickAdd",
  () => new ErPrompt<ErQuickAddRequest>(),
);

/** What a dot of `source` dropped on empty board can create there. */
export function erQuickAddOptions(source: ErConnectSource): ErQuickAddOption[] {
  const id = source.id;
  switch (source.type) {
    case "er-entity":
      return [
        { id: "attribute", label: "Attribute", run: (e, at) => e.addAttribute(id, { at }) },
        {
          id: "key-attribute",
          label: "Key attribute",
          run: (e, at) => e.addAttribute(id, { at, key: "pk" }),
        },
        {
          id: "related-entity",
          label: "Related entity",
          run: (e, at) => e.addRelatedEntity(id, { at }),
        },
        { id: "relation", label: "Relation", run: (e, at) => e.addRelation([id], { at }) },
        { id: "subtype", label: "Subtype (hierarchy)", run: (e, at) => e.addSubtype(id, { at }) },
      ];
    case "er-relation":
      return [
        { id: "attribute", label: "Attribute", run: (e, at) => e.addAttribute(id, { at }) },
        {
          id: "participant",
          label: "Participating entity",
          run: (e, at) => e.addParticipantEntity(id, { at }),
        },
      ];
    case "er-isa":
      return [
        {
          id: "child",
          label: "Child entity",
          run: (e, at) => e.addIsaChildEntity(id, { at }),
        },
        {
          id: "attribute",
          label: "Discriminator attribute",
          run: (e, at) => e.addAttribute(id, { at }),
        },
      ];
  }
}
