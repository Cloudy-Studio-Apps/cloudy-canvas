# Live sessions: UI

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Live sessions

- **Live sessions** (people editing together; guide: `docs/collaboration.md`): the person sharing a file **is** the server, and guests connect to their app peer to peer; when the host stops or quits, the guests' editors close and nothing stays on their computers. Desktop only.

## UI

- **UI** (`canvas-ui/share/`): `ShareButton` (both top bars; a `LiveBadge` for guests) opens `ShareDialog` (`StartSharing`, then `HostingPanel`: the link, `GuestRow`s with Direct/Via relay, role and Remove, Stop sharing); `LiveSessionLayer` (both chromes) shows `ShareKnocks`. `startSharing`/`stopSharing`/`useHostedSession` hold the one hosted session (quitting stops it, `appLifecycle.onBeforeQuit`); `useHostedFile(file, engine)` marks the file context `live` (`LiveFile`: `side`, `role`, `host`) and stops sharing when the editor closes. Guests: `/join/:ticket` (`pages/join/`: the name asked once, the waiting screens, `useHeldGuest`, which keeps one `ShareGuest` across remounts, the missing-plugins notice, `ReconnectingBanner`), then `BoardEditor`/`DesignEditor` with `live` (the loader's `source.live`, `LiveBoardSession`/`LiveDesignSession` with `useLiveGuestFile`: the host's file id and name, never saved, no thumbnail or recents, read-only for viewers). Home's top bar has Join (paste a link). The name is asked once when the app starts without one (`NamePrompt`, `shared/profile/`, mounted in the providers), prefilled with `randomPersonName()` (`shared/core/presence/`: "Sleepy Puffin"), which is kept if the dialog is dismissed. Session hooks that write derived data run on the host only (`useEmbedPreviews`).

## Presence

- **Presence:** awareness states are `{ user: ShareIdentity, presence: CollaboratorState }` (`RoomPresence`); `useRoomPresence` (from `useHostedFile` and `useLiveGuestFile`) publishes the user's pointer (`clientToWorld`), view, selection and page at most every 50 ms and mirrors the others into the collaborators store (`mirrorRoomPresence`), so `CollaboratorLayer`, the stack and following work for people as for agents. Each person's agents on the shared file ride in their state (`RoomPresence.agents`, `RoomAgent`: id, name, app `clientId`, `idleFor` ms rather than a time, `running`, presence; `ownAgentsOn`/`roomAgents` in `room-agents.ts`, re-sent only when the user's own agents change): the others mirror them as `kind: "agent"` collaborators (`room:<client>:<agent id>`) drawn in the owner's colour with the app's logo, with `Collaborator.owner` (`collaboratorTitle`: "Claude Code · Sleepy Puffin" in cursors, outlines, the stack and the follow bar) and `permissions.undo: false` (only the owner undoes them). The Agents menu lists only this app's own (`AGENT_SOURCE`, `CollaboratorList`'s `source`). A viewer's agents can read: on a read-only document an actor document's writes throw `ReadOnlyDocumentError` (`canvas/document/`), and `get_board`/`get_design` report `editable: false`.

## Testing on one machine

- Testing on one machine: a debug build started with `CLOUDY_INSTANCE` set skips the single-instance plugin (`second_instance_allowed`, `src-tauri/src/lib.rs`).
