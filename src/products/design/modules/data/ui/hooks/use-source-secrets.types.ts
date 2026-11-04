/** What this device holds of a source's secrets. */
export interface SourceSecrets {
  /** The secrets (`key`, `key.name`) saved on this device. */
  stored: ReadonlySet<string>;
  /** The ones the source needs that this device lacks. */
  missing: string[];
  /** Reads them again (after the settings saved a secret). */
  refresh(): void;
}
