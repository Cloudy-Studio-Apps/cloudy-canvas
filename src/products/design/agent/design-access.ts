import { stringList, type ToolArgs } from "@canvas";

import type { DesignWorkspace } from "../design-engine.types";
import type { AgentDesign, DesignAgentHost } from "./design-agent.types";

export function requireDesign(host: DesignAgentHost): AgentDesign {
  const design = host.design();
  if (!design) throw new Error("No design is open. Call open_design or new_design first.");
  return design;
}

/** The ids, after checking each is a layer of the design. */
export function requireNodes(engine: DesignWorkspace, ids: string[]): string[] {
  const missing = ids.find((id) => !engine.getElement(id));
  if (missing) throw new Error(`No layer with id ${missing}.`);
  return ids;
}

/** The `ids` given (each checked), or `undefined` when omitted (the whole design). */
export function optionalNodeIds(engine: DesignWorkspace, args: ToolArgs): string[] | undefined {
  if (args.ids === undefined || args.ids === null) return undefined;
  const ids = requireNodes(engine, stringList(args, "ids"));
  if (ids.length === 0) throw new Error('"ids" is empty: omit it for the whole design.');
  return ids;
}
