# Collaborators and presence

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

Everyone else on the user's files is a **collaborator**: agents, and people in live sessions, through the same model and UI.

## Presence

- **Presence** (`shared/core/presence/`, plain data shaped like a Yjs awareness state): a `Collaborator` (`id`, `source`, `kind` `agent`/`user`, `name`, `color`, `avatar`, `permissions`, `running`, `lastSeen`) with its `CollaboratorState` (`fileId`, `scope`, `scopeLabel`, `cursor`, `viewport`, `selection`, `activity`). Sources write through a `PresenceSink` (`join`, `patch`, `leave`, `clearSource`), which `useCollaboratorsStore` (`shared/stores/collaborators-store.ts`) implements; it also holds `following` (`follow`, `unfollow`). `canUndoFor(c)` (`permissions.undo`) says whether the user may undo a collaborator's steps: agents yes, people no (their history is on their computer). The live sessions' room source (`canvas-ui/share/room-presence.ts`, `source: "room"`) maps awareness states to `join`/`patch`/`leave`, and the user's own state comes from the engine (see Live sessions).
