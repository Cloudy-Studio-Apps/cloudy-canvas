export interface RelayStatusState {
  /** When hosting last found the built-in relay unreachable (`Date.now()`), `null` while it works. */
  builtInDownSince: number | null;
  setBuiltInDown: (down: boolean) => void;
}
