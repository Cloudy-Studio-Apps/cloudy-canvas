import type { PeerPathLabelProps } from "./share-dialog.types";

const LABELS = { direct: "Direct", relay: "Via relay" } as const;
const HINTS = {
  direct: "Connected straight to this computer",
  relay: "The relay server carries this connection (a direct one couldn't be made yet)",
} as const;

/** "Direct" or "Via relay": how a guest is connected. */
export function PeerPathLabel({ path }: PeerPathLabelProps) {
  if (!path) return <span className="text-xs text-muted-foreground">Connecting…</span>;
  return (
    <span className="text-xs text-muted-foreground" title={HINTS[path]}>
      {LABELS[path]}
    </span>
  );
}
