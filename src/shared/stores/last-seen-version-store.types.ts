export interface LastSeenVersionState {
  /** The last version the user was told about; `null` before the app's first start. */
  version: string | null;
  see: (version: string) => void;
}
