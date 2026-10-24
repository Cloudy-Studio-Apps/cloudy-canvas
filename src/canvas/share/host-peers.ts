import type { HostPeer } from "./host-peers.types";
import type { ShareHostState } from "./share-host.types";

/** A connection that has said nothing yet. */
export function newPeer(peer: number): HostPeer {
  return {
    peer,
    stage: "hello",
    identity: { name: "", color: "" },
    appVersion: "",
    role: "view",
    rejoin: null,
    origin: { peer },
    clients: new Set(),
    timer: null,
  };
}

/** What the host's UI shows: the guests let in and the ones knocking. */
export function hostSnapshot(peers: Iterable<HostPeer>): ShareHostState {
  const list = [...peers];
  return {
    guests: list
      .filter((p) => p.stage === "admitted")
      .map((p) => ({
        peer: p.peer,
        identity: p.identity,
        role: p.role,
        appVersion: p.appVersion,
        clients: [...p.clients],
      })),
    knocks: list
      .filter((p) => p.stage === "knocking")
      .map((p) => ({ peer: p.peer, identity: p.identity, appVersion: p.appVersion })),
  };
}

export function clearTimer(p: HostPeer): void {
  if (p.timer) clearTimeout(p.timer);
  p.timer = null;
}
