import type { CanvasDocument } from "@canvas";

import { allFlows } from "./all-flows";
import { defaultFlowDevice } from "./devices";
import type { PrototypePlatform } from "./flow.types";
import type { PlayTarget } from "./play-target.types";
import type { PrototypeSelection } from "./prototype-selection.types";
import { screenOf } from "./screens";

/** Web and desktop are one kind of device, mobile and tablet the other. */
const isWide = (platform: PrototypePlatform): boolean =>
  platform === "web" || platform === "desktop";

/**
 * What Play runs for a selection: a selected flow; the flow a selected screen (or a layer's) starts;
 * else the page's first flow of the same device kind, beginning at that screen; else the first flow.
 * `null` when the page has no flows.
 */
export function playTarget(
  doc: CanvasDocument,
  page: string,
  selection: PrototypeSelection,
): PlayTarget | null {
  const flows = allFlows(doc).filter((flow) => flow.page === page);
  const first = flows[0];
  if (!first) return null;
  if (selection.kind === "flow") {
    const picked = flows.find((flow) => flow.id === selection.id);
    return { flow: (picked ?? first).id };
  }
  if (selection.kind === "none") return { flow: first.id };

  const screen = screenOf(doc, selection.kind === "screen" ? selection.id : selection.screen);
  if (!screen) return { flow: first.id };
  const starting = flows.find((flow) => flow.start === screen.id);
  if (starting) return { flow: starting.id };
  const wide = isWide(defaultFlowDevice(screen).platform);
  const match = flows.find((flow) => isWide(flow.platform) === wide);
  return match ? { flow: match.id, at: screen.id } : { flow: first.id };
}
