/** Secrets (API keys, tokens) kept on this device only; they never go into a file. */
export interface SecretStore {
  /** The stored value, or `null` when there is none. */
  get(key: string): Promise<string | null>;
  /** Stores a value; `null` deletes it. */
  set(key: string, value: string | null): Promise<void>;
}
