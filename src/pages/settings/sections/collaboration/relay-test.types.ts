import type { RelaySettings } from "@shared/core";

export type RelayTestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "ok"; millis: number }
  | { status: "failed"; message: string };

export interface RelayTestRowProps {
  /** The relay to test, or `null` while there's nothing to test (the button is disabled). */
  relay: RelaySettings | null;
  state: RelayTestState;
  onTest: (relay: RelaySettings) => void;
}
