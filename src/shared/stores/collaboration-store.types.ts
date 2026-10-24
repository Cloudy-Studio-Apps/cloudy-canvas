import type { RelaySettings } from "@shared/core";

/**
 * Which relay live sessions this app hosts go through: the one the app was built with, n0's public
 * ones, or the user's own.
 */
export type RelayChoice = "builtin" | "public" | "custom";

export interface CollaborationState {
  /** The name others see in live sessions (`""` until the user picks one). */
  name: string;
  setName: (name: string) => void;
  /** The colour of the user's cursor for others (`#rrggbb`), picked once at random. */
  color: string;
  relayChoice: RelayChoice;
  /** The user's own relay, kept while the public ones are chosen. */
  customRelay: RelaySettings;
  setRelayChoice: (choice: RelayChoice) => void;
  setCustomRelay: (relay: RelaySettings) => void;
}
