# Groups

Groups (Ctrl+G, Ctrl+Shift+G): layers held together, whose bounds follow their children.

- **Tier:** core
- **Requires:** core
- **Contributes:** kinds `GroupKind`; designCanvas: `hostCommands`, `kinds`, `onMoved`, `onRemove`; designEditor: `contextMenu`, `layerIcons`, `mainMenu`, `sessionHooks`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `group_nodes`, `ungroup_nodes`
- **Files:** `group.kind.ts`, `group-nodes.ts` (grouping and ungrouping), `group-tree.ts`, `group.mcp.ts`, `ui/`.

## How it works

- **Groups** (`group/`): `GroupKind extends ChildHostKind` draws nothing and isn't hit; its `resolveFromChildren` wraps its children (leaving out what a mask hides), `pruneEmptyGroups` (`onRemove`, `onMoved`) removes emptied groups, and the `group` (Ctrl+G) and `ungroup` (Ctrl+Shift+G) host commands (`groupNodes`, `ungroupNodes`, run by `useGroupCommands`) are in the context menu and the main menu. Children of a node that isn't a `container` stay in it when dragged. A hidden frame or group hides what it holds (an empty clip from `treeClips`).
