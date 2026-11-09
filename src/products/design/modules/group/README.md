# Groups

Groups (Ctrl+G, Ctrl+Shift+G): layers held together, whose bounds follow their children. Frame selection (Ctrl+Alt+G) sits next to them.

- **Tier:** core
- **Requires:** core, frame
- **Contributes:** kinds `GroupKind`; designCanvas: `hostCommands`, `kinds`, `onMoved`, `onRemove`; designEditor: `contextMenu`, `layerIcons`, `mainMenu`, `sessionHooks`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `group_create`, `group_frame_create`, `group_release`
- **Files:** `group.kind.ts`, `group-nodes.ts` (grouping and ungrouping), `group-tree.ts`, `group.mcp.ts`, `ui/`.

## How it works

- **Groups** (`group/`): `GroupKind extends ChildHostKind` draws nothing and isn't hit; its `resolveFromChildren` wraps its children (leaving out what a mask hides), `pruneEmptyGroups` (`onRemove`, `onMoved`) removes emptied groups, and the `group` (Ctrl+G) and `ungroup` (Ctrl+Shift+G) host commands (`groupNodes`, `ungroupNodes`, run by `useGroupCommands`) are in the context menu and the main menu. So is `frameSelection` (Ctrl+Alt+G, `frameNodes` from the frame module, `group_frame_create` for agents): it wraps the selection the same way in a frame with no fill and no clip, so nothing looks different, and the command lives here to sit between Group and Ungroup in those menus. Children of a node that isn't a `container` stay in it when dragged. A hidden frame or group hides what it holds (an empty clip from `treeClips`).
