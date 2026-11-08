// The prototype's data: interactions on nodes (read defensively, `nodeInteractions`), the flow
// records, the devices flows play on, screens, the service that edits them all and the pruning
// after deletes.
export type * from "./interaction.types";
export type * from "./flow.types";
export type * from "./prototype-selection.types";
export { DEFAULT_OVERLAY, DEFAULT_TRANSITION, newInteraction } from "./interaction-defaults";
export { editInteraction } from "./edit-interaction";
export { readInteraction } from "./read-interaction";
export { nodeInteractions } from "./node-interactions";
export { interactionsPatch, writeInteractions } from "./write-interactions";
export { PROTOTYPE_FLOW_DEFAULTS } from "./flow.defaults";
export { PrototypeFlowKind } from "./flow.kind";
export { isFlow } from "./is-flow";
export { defaultFlowDevice, firstDevice, PROTOTYPE_DEVICES } from "./devices";
export { isScreen, screenOf, screensOf } from "./screens";
export { DESIGN_PROTOTYPE, DesignPrototype } from "./design-prototype";
export { prunePrototype } from "./prune-prototype";
export type * from "./player-session.types";
export type * from "./play-target.types";
export { allFlows } from "./all-flows";
export { mirrorTransition } from "./mirror-transition";
export { applyInteraction, currentScreen, startSession } from "./player-session";
export { playTarget } from "./play-target";
