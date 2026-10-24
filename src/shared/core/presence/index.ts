// Who else works on the user's files (collaborators) and where they are, as plain data. Sources
// write it through a `PresenceSink`: the agent source (`app/mcp`) now; later a shared room maps
// each Yjs awareness state to `join`/`patch`/`leave`. The local user's own state, when a room
// needs it, is read from the engine (`visibleWorldRect`, `selectedIds`, `scope`, `onViewChange`).
export type * from "./presence.types";
export { canUndoFor } from "./permissions";
export { EMPTY_COLLABORATOR_STATE } from "./empty-state";
export { randomPersonName } from "./random-name";
