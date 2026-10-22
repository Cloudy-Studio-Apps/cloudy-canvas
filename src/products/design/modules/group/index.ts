// Groups: layers that select and move as one (Ctrl+G / Ctrl+Shift+G). Their bounds follow their
// children, and a click on a child selects the group until it's entered (double-click).
export type * from "./group.types";
export { GROUP_TYPE } from "./group.constants";
export { createGroup } from "./group.factory";
export { GroupKind } from "./group.kind";
export { groupNodes, pruneEmptyGroups, ungroupNodes } from "./group-nodes";
export { groupSelectTarget } from "./group-select-target";
export { enclosingGroups, isGroup } from "./group-tree";
export { resolveGroups } from "./resolve-groups";
