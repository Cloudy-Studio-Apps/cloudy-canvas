import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { ErAggregateKind } from "./aggregate";
import { ErAttributeKind } from "./attribute";
import { ErConstraintKind } from "./constraint";
import { ErEntityKind } from "./entity";
import { ErTool } from "./er.tool";
import { ErIsaKind } from "./isa";
import { ErLinks } from "./links";
import {
  prepareErCopies,
  pruneEr,
  resolveErElements,
  splitErDiagrams,
  withErMembers,
} from "./model";
import { ErRelationKind } from "./relation";
import { ErUnionKind } from "./union";

/** The ER element kinds, the tool (E), the lines and the hooks that keep a diagram whole. */
export function registerErCanvas(host: ModuleHost): void {
  host.contribute(
    boardCanvas.kinds,
    new ErEntityKind(),
    new ErRelationKind(),
    new ErAttributeKind(),
    new ErIsaKind(),
    new ErAggregateKind(),
    new ErConstraintKind(),
    new ErUnionKind(),
  );
  host.contribute(boardCanvas.tools, {
    id: "er",
    create: (ctx) => new ErTool(ctx),
    keys: [{ key: "e" }],
  });
  host.contribute(boardCanvas.links, () => new ErLinks());
  // Aggregation boxes and constraints follow the ER elements they're about.
  host.contribute(boardCanvas.resolveElements, (elements) => resolveErElements(elements));
  // An ER element takes its attributes along, and dragging an aggregation box takes what it holds.
  host.contribute(boardCanvas.withMembers, (ids, elements, purpose) =>
    withErMembers(ids, elements, purpose === "move"),
  );
  // ER elements that belonged to deleted ones go with them, and parts of a diagram the deletion
  // cut off from the rest become diagrams of their own.
  host.contribute(boardCanvas.onRemove, (doc, _removed, before) => {
    pruneEr(doc);
    splitErDiagrams(doc, before);
  });
  // Copies get their own diagrams.
  host.contribute(boardCanvas.prepareCopies, prepareErCopies);
}
