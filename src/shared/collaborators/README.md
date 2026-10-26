# Collaborators UI

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Following

- **Following** (Figma's): `engine.showViewport(rect)` glides the camera to show a rect exactly (`CameraGlide`, `camera.fitZoom`, reduced motion jumps), `engine.onUserCamera` fires only for the person's own wheel and pan input (following stops then), and `engine.setHistoryTarget({ owner, history })` makes Undo/Redo (commands, `HistoryControls`, `EngineState.canUndo`, `historyOwner`, `undoLabel`/`redoLabel`) step through someone else's history.

## UI

- **UI:** `shared/collaborators/` has `CollaboratorAvatar`, `CollaboratorStack` (top bars, Figma's: overlapping round avatars, at most `max` (3, the followed one always shown), the rest in a "+N" `CollaboratorOverflow` menu listing everyone; `followable` in editors: click follows or stops), `CollaboratorList` (the Agents menu's rows, with `actions`) and `useFollowToggle`. `canvas-ui`'s `CollaboratorLayer` (over both editors' canvas) draws the cursors and selection outlines of collaborators on this file and page (`agent-server-store.showCollaborators`) and, while following, `useFollowCollaborator` (their page and viewport drive the camera; Undo/Redo target their history when `canUndoFor`), the `FollowFrame` and the `FollowBar` (activity, page, labelled Undo/Redo, Stop following). `CollaboratorUndoButton` undoes an agent's last step from the menu (`useCollaboratorHistory`).

## Not yet

- Not yet: agents' own text editing sessions.
