// Vector networks (Figma's model): vertices joined by bezier segments that may branch, with
// filled regions. Shapes convert to them, and vectors are edited as them.
export type * from "./network.types";
export { bendThrough, flatten, nearestT, pointAt, splitAt } from "@canvas";
export { loopCurves, otherEnd, segmentCurve, segmentsAt, tangentAt } from "./network-curves";
export {
  addVertex,
  bendSegment,
  connect,
  cutSegment,
  moveVertices,
  removeParts,
  setTangent,
  splitSegment,
  toggleRegion,
  toggleSmooth,
} from "./network-edits";
export { faceAt, networkFaces } from "./network-faces";
export { hitSegment, insideRegion, networkBounds, vertexAt } from "./network-geometry";
export { placeNetwork, scaleNetwork } from "./network-placement";
export { ellipseNetwork, polygonNetwork, polylineNetwork, rectNetwork } from "./network-shapes";
export { traceRegions, traceStrokes } from "./network-trace";
export { strokeChains } from "./network-chains";
export { curvesContour, pathToNetwork, regionPath, strokePath } from "./network-path";
export { NETWORK_SCHEMA, readNetwork } from "./network-args";
