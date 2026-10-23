import type { ErPaletteItem } from "./er-palette.types";

/** The palette's buttons, top to bottom, with what their tooltips say. */
export const ER_PALETTE_ITEMS: readonly ErPaletteItem[] = [
  { id: "entity", label: "Entity", description: "Click to add, or drag onto the board." },
  {
    id: "weak-entity",
    label: "Weak entity",
    description: "An entity identified through a relation (double rectangle).",
  },
  {
    id: "relation",
    label: "Relation",
    description: "Drag onto an entity to start a relation from it.",
  },
  {
    id: "associative",
    label: "Associative entity",
    description: "A relation that is also an entity: it has a key and takes part in relations.",
  },
  { id: "attribute", label: "Attribute", description: "Drag onto an entity or relation." },
  {
    id: "key-attribute",
    label: "Key attribute",
    description: "An identifying attribute; drag onto an entity.",
  },
  { id: "isa", label: "Hierarchy", description: "Drag onto the parent entity (is-a)." },
  {
    id: "union",
    label: "Union type",
    description: "A category: drag onto the entity that unites its superclasses.",
  },
  { id: "aggregate", label: "Aggregation", description: "Drag onto a relation to aggregate it." },
  {
    id: "constraint",
    label: "Constraint",
    description: "Click to add an exclusion constraint between two relations.",
  },
];
