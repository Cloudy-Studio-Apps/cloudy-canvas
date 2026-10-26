# Live sessions: sync

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Sync

- **Sync** (`canvas/share/`, plain TS): a star. `ShareHost.start(options)` (the user's `CanvasDocument`, transport, relay, file info, identity) relays every document update (`doc.on("update")`) and awareness update to the admitted guests but the one it came from, applies a guest's sync messages with its own origin only when it can edit (`readSync`, `sync-messages.ts`: a viewer's writes are dropped), turns away wrong secrets and protocols, holds newcomers as `knocks` until `admit(peer, role)`/`deny`, and has `setRole`, `remove`, `peerPath`, `stop` (tells everyone `ended`, gives them a second to close); `state` is a `Store<ShareHostState>` (`guests`, `knocks`). `ShareGuest.join(options)` syncs into its own `Y.Doc` (`HOST_ORIGIN`), sends its edits while it can edit, retries a dropped connection for 30 s with its rejoin key (the host lets it back with its role), and ends on `ended`/`removed`/`denied` (`ShareGuestState`: `status` connecting → waiting → syncing → live, `reconnecting`, `closed` with `end`). Remote updates need nothing else: `doc.observe` redraws them, `afterEdit` runs only where the edit was made, `doc.history` ignores them, and the host's autosave saves them.
