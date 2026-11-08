import { isPage } from "../../../pages";
import type { DesignEngine } from "../../../../design-engine.types";
import { allFlows, DESIGN_PROTOTYPE } from "../../model";
import { deviceSize } from "./device-size";
import type { PlayerView } from "./player-run.types";
import type { PlayerShown } from "./player-shown.types";
import { playerSurfaces } from "./player-surfaces";
import { playerWorkspace } from "./player-workspace";
import { screenSlug } from "./screen-slug";

/**
 * What the player draws for a session, read from the document as it is now: the flow, its page's
 * flows, the device and what's on it. `null` once the flow (or every screen it showed) is gone.
 */
export function playerShown(
  engine: DesignEngine,
  flowId: string,
  view: PlayerView,
): PlayerShown | null {
  const flow = engine.service(DESIGN_PROTOTYPE).flow(flowId);
  const device = flow ? deviceSize(engine.doc, view.state) : null;
  if (!flow || !device) return null;
  // The page on screen is the flow's (the editor waits while the player is open); the player's
  // own workspace reads it when something else moved the editor to another page.
  const workspace = engine.scope === flow.page ? engine : playerWorkspace(engine, flow.page);
  const surfaces = playerSurfaces(engine.doc, workspace, view, device);
  const page = engine.doc.get(flow.page);
  const screen = surfaces.base ? screenSlug(surfaces.base.screen.name) : "";
  return {
    flow,
    flows: allFlows(engine.doc).filter((candidate) => candidate.page === flow.page),
    device,
    surfaces,
    address: `${page && isPage(page) ? page.name : ""}/${screen}`,
  };
}
