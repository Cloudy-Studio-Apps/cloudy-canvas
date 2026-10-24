# Live sessions

Cloudy Canvas lets people edit a board or a design together, live, without a sync server. The person sharing a file **is** the server: their app holds the document and saves it, and the people they let in connect to it directly.

- **Host:** opens a file, presses **Share**, then **Start sharing**, and sends the link.
- **Guest:** opens the link (or pastes it in Home › **Join**), says their name the first time, and waits for the host to let them in.
- **The host decides:** each newcomer shows as a card ("Ana wants to join") with **Can edit**, **Can view** and **Deny**. In the Share dialog the host can change someone's role or remove them.
- **When it ends:** the host presses **Stop sharing**, closes the file or quits the app. Every guest's editor closes with "The session ended", and nothing is left on their computer.

Everyone sees the others' cursors, selections and pages, and can follow them (the avatars in the top bar). Each person's Ctrl+Z undoes only their own changes. Agents connected to anyone's app show too, with their app's logo ringed in their owner's colour and the owner's name ("Claude Code · Sleepy Puffin"); only their owner can undo their steps. A viewer's agent can read the file but not edit it.

## How it connects

The apps connect peer to peer with [iroh](https://iroh.computer): QUIC connections, end-to-end encrypted, dialed by the host's public key. Routers and NATs are crossed by hole punching. When that fails (strict NATs, some corporate and mobile networks), a **relay** forwards the encrypted traffic. The Share dialog shows each guest as **Direct** or **Via relay**.

Sessions use the **Cloudy Canvas relay** the app was built with. When it can't be reached, the session is started again through n0's public relays, and **Settings › Collaboration** shows a note saying so; the Cloudy Canvas relay is tried again after five minutes. The link carries the relay the session uses, so guests use it too. Development builds also let Settings pick n0's relays or your own server (see [`server/relay/README.md`](../server/relay/README.md) for setting one up on a small VPS).

The built-in relay comes from `VITE_CLOUDY_RELAY_URL` and `VITE_CLOUDY_RELAY_TOKEN` at build time: `.env.local` for your own builds (see `.env.example`), and the repository secrets `CLOUDY_RELAY_URL` and `CLOUDY_RELAY_TOKEN` for releases. A build without them offers n0's public relays by default. The token ends up in every copy of the app and in every link, so it only keeps the relay from being used casually; the relay's limits cap the rest, and documents are end-to-end encrypted either way.

## What the link holds

`cloudy-canvas://join/<ticket>`, where the ticket holds the host's address, its relay (with the relay's access token) and a random secret for this session. The host turns away anyone without the secret before asking. A new session has a new key and secret, so old links stop working once sharing stops.

## Good to know

- **Desktop only** for now: the browser build can't make these connections.
- **The host's upload carries everything:** each guest receives the whole file (images included) from the host when they join. A session takes up to 10 guests.
- **Dropped connections:** a guest whose connection drops keeps editing and retries for 30 s. Their changes are sent once they're back, and they keep their role.
- **Plugins:** a guest without one of the host's plugins is told. What the plugin adds stays in the file but isn't shown to them.
- **Versions:** both apps need the same session protocol. A guest with another app version is shown on the host's knock card.
- **Saving:** only the host saves (autosave included). Guests' Save says so.

## Testing on one computer

Run the app twice: the second window needs a debug build started with `CLOUDY_INSTANCE` set, which skips the single-instance check. With `pnpm tauri dev` running, start the same binary again:

```sh
CLOUDY_INSTANCE=2 src-tauri/target/debug/cloudy-canvas
```

Both windows share the app data folder, which is fine for a test. For the real thing, use two computers on different networks (a phone hotspot is an easy second network).

## Code

The architecture is described in `CLAUDE.md` under "Collaborators and workspaces › Live sessions": the transport (`src-tauri/src/share/`, `src/platform/tauri-share-transport.ts`), the protocol (`src/shared/core/share/`), the sync (`src/canvas/share/`) and the UI (`src/canvas-ui/share/`, `src/pages/join/`).
