import { PlayerDialog } from "./player-dialog";
import { usePlayerStore } from "./player-store";

/**
 * The Prototype mode's player (an `overlays` entry): open while it has a target. Another target
 * (the bar's flow picker) starts a new session.
 */
export function Player() {
  const target = usePlayerStore((state) => state.target);
  if (!target) return null;
  return <PlayerDialog key={`${target.flow}:${target.at ?? ""}`} target={target} />;
}
