// Moving layers in the tree: the one place that decides where layers may go (`moveIntoProblem`)
// and writes their parent and order (`moveLayers`), for the layers panel, the canvas and agents.
export type * from "./layer-move.types";
export { holdsLayers, moveIntoProblem } from "./move-into";
export {
  layerChildren,
  layerDestinationAt,
  layerMovePatches,
  moveLayers,
  placeLayers,
} from "./move-layers";
