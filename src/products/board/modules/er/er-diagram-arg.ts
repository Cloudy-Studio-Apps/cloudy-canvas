import { optionalBoolean, optionalString, type ToolArgs } from "@canvas";
import { createId } from "@shared/core";

import type { ErDiagram, ErModel } from "./model";

export const ER_DIAGRAM_ARG = {
  type: "string",
  description:
    "Diagram id or name from list_er_diagrams. Can be left out when the board has one diagram.",
};

/**
 * The diagram a tool call is about: the `diagram` arg (id or name), a new one with `new: true`
 * (when `canCreate`), or the board's only diagram. A board without diagrams gets a new one when
 * `canCreate`.
 */
export function diagramArg(er: ErModel, args: ToolArgs, canCreate: boolean): ErDiagram {
  const diagrams = er.diagrams();
  if (canCreate && optionalBoolean(args, "new")) return er.diagram(createId());
  const wanted = optionalString(args, "diagram");
  if (wanted !== undefined) {
    const found =
      diagrams.find((d) => d.id === wanted) ??
      diagrams.find((d) => d.name.toLowerCase() === wanted.toLowerCase());
    if (!found) throw new Error(`No ER diagram "${wanted}". ${listing(diagrams)}`);
    return er.diagram(found.id);
  }
  const [only, ...rest] = diagrams;
  if (only && rest.length === 0) return er.diagram(only.id);
  if (!only && canCreate) return er.diagram(createId());
  if (!only) throw new Error("The board has no ER diagram yet.");
  throw new Error(
    `The board has ${diagrams.length} ER diagrams; pass "diagram". ${listing(diagrams)}`,
  );
}

function listing(diagrams: ReturnType<ErModel["diagrams"]>): string {
  if (diagrams.length === 0) return "The board has no ER diagrams.";
  return `Diagrams: ${diagrams.map((d) => `${d.id} (${d.label})`).join(", ")}.`;
}
