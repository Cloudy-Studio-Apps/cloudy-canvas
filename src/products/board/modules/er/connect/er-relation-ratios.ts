import { defineService } from "@canvas";

import type { ErRelationRatio, ErRelationRequest } from "./er-connect.types";
import { ErPrompt } from "./er-prompt";

/**
 * The binary relations the connect prompt offers, in Chen (min,max) participation: the number
 * beside an entity says how many times one of it takes part. The side the other links to (the
 * "one" side, or both in many-to-many) is asked for its join attribute, usually its key.
 */
export const ER_RELATION_RATIOS: readonly ErRelationRatio[] = [
  {
    id: "one-to-one",
    label: "One to one",
    from: "one",
    to: "one",
    fromCardinality: { min: "0", max: "1" },
    toCardinality: { min: "0", max: "1" },
    joins: ["from"],
    describe: (from, to) => `Each ${from} has at most one ${to}, and the other way round`,
  },
  {
    id: "one-to-many",
    label: "One to many",
    from: "one",
    to: "many",
    fromCardinality: { min: "0", max: "n" },
    toCardinality: { min: "1", max: "1" },
    joins: ["from"],
    describe: (from, to) => `Each ${from} has many ${to}; each ${to} belongs to one ${from}`,
  },
  {
    id: "many-to-one",
    label: "Many to one",
    from: "many",
    to: "one",
    fromCardinality: { min: "1", max: "1" },
    toCardinality: { min: "0", max: "n" },
    joins: ["to"],
    describe: (from, to) => `Each ${from} belongs to one ${to}; each ${to} has many ${from}`,
  },
  {
    id: "many-to-many",
    label: "Many to many",
    from: "many",
    to: "many",
    fromCardinality: { min: "0", max: "n" },
    toCardinality: { min: "0", max: "n" },
    joins: ["from", "to"],
    describe: (from, to) => `Each ${from} has many ${to}, and each ${to} many ${from}`,
  },
];

/**
 * Two elements a connect dot linked, waiting for the kind of relation (the relation prompt).
 * One per engine: `ctx.service(ER_RELATION_PROMPT)`, `useService(ER_RELATION_PROMPT)`.
 */
export const ER_RELATION_PROMPT = defineService(
  "board.erRelationPrompt",
  () => new ErPrompt<ErRelationRequest>(),
);
