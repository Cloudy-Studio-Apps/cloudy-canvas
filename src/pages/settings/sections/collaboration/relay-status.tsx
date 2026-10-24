import { BUILT_IN_RELAY } from "@shared/stores/built-in-relay";
import { RelayDownNote } from "./relay-down-note";

/** Release builds: the relay sessions use, and a note while the official one can't be reached. */
export function RelayStatus() {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">Connection</p>
        <p className="text-sm text-muted-foreground">
          {BUILT_IN_RELAY
            ? "Sessions connect through the Cloudy Canvas relay when a direct connection can't be made. It never sees your files."
            : "Sessions connect through public relays (n0) when a direct connection can't be made. They never see your files."}
        </p>
      </div>
      {BUILT_IN_RELAY && <RelayDownNote />}
    </div>
  );
}
