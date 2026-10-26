# Group (Design module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Groups

- **Groups** (`group/`): `GroupKind extends ChildHostKind` draws nothing and isn't hit; its `resolveFromChildren` wraps its children (leaving out what a mask hides), `pruneEmptyGroups` (`onRemove`, `onMoved`) removes emptied groups, and the `group` (Ctrl+G) and `ungroup` (Ctrl+Shift+G) host commands (`groupNodes`, `ungroupNodes`, run by `useGroupCommands`) are in the context menu and the main menu. Children of a node that isn't a `container` stay in it when dragged. A hidden frame or group hides what it holds (an empty clip from `treeClips`).
