import type { AvailableUpdate, InstallKind } from "@shared/core";

/**
 * Where checking and installing stand: `available` until the user acts on it, `downloading` with
 * the share done (`null` while the size is unknown), then `restarting`.
 */
export type UpdateStatus =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "upToDate" }
  | { phase: "error"; message: string }
  | { phase: "available"; update: AvailableUpdate }
  | { phase: "downloading"; update: AvailableUpdate; progress: number | null }
  | { phase: "restarting"; update: AvailableUpdate };

export interface CheckOptions {
  /** A background check: errors are only logged, not shown. */
  silent?: boolean;
}

export interface UpdateState {
  status: UpdateStatus;
  /** How the app was installed, once read; `null` where it can't update (browser, dev builds). */
  installKind: InstallKind | null;
  /** The version whose notice was closed with "Later", hidden until the next start. */
  dismissed: string | null;
  check: (options?: CheckOptions) => Promise<void>;
  /** Installs the available update, or opens its download page for a package install. */
  install: () => Promise<void>;
  dismiss: () => void;
}
