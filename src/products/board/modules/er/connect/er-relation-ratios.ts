import { defineService } from "@canvas";

import type { ErRelationRatio, ErRelationRequest } from "./er-connect.types";
import { ErPrompt } from "./er-prompt";
import { t } from "../er.i18n";

/**
 * The binary relations the connect prompt offers, in Chen (min,max) participation: the number
 * beside an entity says how many times one of it takes part. The side the other links to (the
 * "one" side, or both in many-to-many) is asked for its join attribute, usually its key.
 */
export const ER_RELATION_RATIOS: readonly ErRelationRatio[] = [
  {
    id: "one-to-one",
    label: t("ratios.oneToOne"),
    from: "one",
    to: "one",
    fromCardinality: { min: "0", max: "1" },
    toCardinality: { min: "0", max: "1" },
    joins: ["from"],
    describe: (from, to) => t("ratios.describeOneToOne", { from, to }),
  },
  {
    id: "one-to-many",
    label: t("ratios.oneToMany"),
    from: "one",
    to: "many",
    fromCardinality: { min: "0", max: "n" },
    toCardinality: { min: "1", max: "1" },
    joins: ["from"],
    describe: (from, to) => t("ratios.describeOneToMany", { from, to }),
  },
  {
    id: "many-to-one",
    label: t("ratios.manyToOne"),
    from: "many",
    to: "one",
    fromCardinality: { min: "1", max: "1" },
    toCardinality: { min: "0", max: "n" },
    joins: ["to"],
    describe: (from, to) => t("ratios.describeManyToOne", { from, to }),
  },
  {
    id: "many-to-many",
    label: t("ratios.manyToMany"),
    from: "many",
    to: "many",
    fromCardinality: { min: "0", max: "n" },
    toCardinality: { min: "0", max: "n" },
    joins: ["from", "to"],
    describe: (from, to) => t("ratios.describeManyToMany", { from, to }),
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
