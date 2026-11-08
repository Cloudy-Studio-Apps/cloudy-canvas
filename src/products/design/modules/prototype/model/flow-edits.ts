import { createElementBase, keyBetween, type CanvasDocument } from "@canvas";

import { t } from "../prototype.i18n";
import { PROTOTYPE_FLOW_TYPE } from "../prototype.constants";
import { allFlows } from "./all-flows";
import { defaultFlowDevice, firstDevice } from "./devices";
import { PROTOTYPE_FLOW_DEFAULTS } from "./flow.defaults";
import type { PrototypeFlowElement, PrototypeFlowPatch } from "./flow.types";
import { isScreen } from "./screens";

/**
 * Adds a flow starting at the screen `start` of the design page `page` (named `name`, else after
 * the screen, on the device its size suggests) and returns it. No checkpoint: the caller makes the
 * undo step.
 */
export function addFlowRecord(
  doc: CanvasDocument,
  page: string,
  start: string,
  name?: string,
): PrototypeFlowElement {
  const screen = doc.get(start);
  if (!isScreen(screen) || screen.pageId !== page) {
    throw new Error(`"${start}" isn't a screen of the page "${page}".`);
  }
  const last = allFlows(doc).at(-1);
  const flow: PrototypeFlowElement = {
    ...createElementBase(
      PROTOTYPE_FLOW_TYPE,
      { x: 0, y: 0, w: 0, h: 0 },
      keyBetween(last?.index ?? null, null),
    ),
    name: name?.trim() || t("flow.defaultName", { screen: screen.name }),
    page,
    start,
    ...defaultFlowDevice(screen),
    ...PROTOTYPE_FLOW_DEFAULTS,
  };
  doc.add(flow);
  return flow;
}

/**
 * The patch that applies `patch` to `flow`: an empty name is dropped, and a new `platform` without
 * a `device` gets that platform's first device. Empty when nothing changes.
 */
export function flowPatch(
  flow: PrototypeFlowElement,
  patch: PrototypeFlowPatch,
): PrototypeFlowPatch {
  const next: PrototypeFlowPatch = { ...patch };
  if (next.name !== undefined) {
    const name = next.name.trim();
    if (name) next.name = name;
    else delete next.name;
  }
  if (next.platform && next.platform !== flow.platform && next.device === undefined) {
    next.device = firstDevice(next.platform);
  }
  return next;
}
