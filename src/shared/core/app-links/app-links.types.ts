import type { FileType } from "../files.types";

/**
 * `cloudy-canvas://` links the OS hands to the app (a browser, another app, a shortcut).
 * Implemented per platform in `platform/`.
 */
export interface AppLinks {
  /** Links the app was launched with. Returned once; later calls give `[]`. */
  launchLinks(): Promise<string[]>;
  /** Links opened while the app runs. Returns an unsubscribe function. */
  onOpen(handler: (links: string[]) => void): () => void;
}

/** What a `cloudy-canvas://` link asks for (`parseAppLink`). */
export type AppLink =
  /** `cloudy-canvas://open?path=<file>`: open a file on disk. */
  | { action: "open"; path: string }
  /** `cloudy-canvas://board/<id>`, `…/design/<id>`: open a recent file by id. */
  | { action: "show"; type: FileType; id: string }
  /** `cloudy-canvas://new/board`, `…/new/design`: start a new file. */
  | { action: "new"; type: FileType }
  /** `cloudy-canvas://join/<ticket>`: join a live session (`shareLink`). */
  | { action: "join"; ticket: string }
  /** `cloudy-canvas://home`, `cloudy-canvas://settings` */
  | { action: "page"; page: AppLinkPage };

export type AppLinkPage = "home" | "settings";
