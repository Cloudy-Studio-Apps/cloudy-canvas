import type { ModuleHost } from "@shared/core";
import { designCanvas, designSelectRedirects } from "../../design-points";
import { pasteGradientOnto } from "./node/paste-gradient";
import { containerAlignTarget } from "./tree/align-target";
import { hostSelectTarget } from "./tree/host-select-target";
import { treeOrderKeys } from "./tree/order-keys";
import { prepareTreeCopies } from "./tree/prepare-tree-copies";
import { reparentMoved } from "./tree/reparent";
import { resolveTree } from "./tree/resolve-tree";
import { selectionRulerFrame } from "./tree/ruler-frame";
import { topFrames } from "./tree/top-frames";
import { treeClips } from "./tree/tree-clips";
import { withDescendants } from "./tree/tree-members";
import { treeUndrawn } from "./tree/tree-undrawn";

/**
 * The canvas view and the layer tree's hooks: drawing order, clipping, members, dropping into
 * frames, copies.
 */
export function registerCoreCanvas(host: ModuleHost): void {
  host.contribute(designCanvas.view, {
    minZoom: 0.02,
    maxZoom: 256,
    grid: "pixels",
    sizeLabel: true,
    snapping: { objects: true, pixelGrid: true, guides: true },
    rulers: true,
  });
  host.contribute(designCanvas.drawOrder, treeOrderKeys);
  host.contribute(designCanvas.clips, treeClips);
  host.contribute(designCanvas.resolveElements, resolveTree);
  host.contribute(designCanvas.undrawn, treeUndrawn);
  // Read when a click happens: every module has contributed by then.
  host.contribute(designCanvas.selectTarget, (hitId, request, elements, kinds) =>
    hostSelectTarget(hitId, request, elements, kinds, host.get(designSelectRedirects)),
  );
  host.contribute(designCanvas.withMembers, (ids, elements) => withDescendants(ids, elements));
  host.contribute(designCanvas.onMoved, reparentMoved);
  host.contribute(designCanvas.alignTarget, containerAlignTarget);
  host.contribute(designCanvas.pasteOnto, pasteGradientOnto);
  host.contribute(designCanvas.rulerFrame, selectionRulerFrame);
  host.contribute(designCanvas.frames, topFrames);
  host.contribute(designCanvas.prepareCopies, prepareTreeCopies);
}
