import type { LibraryHub } from "@canvas-ui";
import type { LibrarySummary } from "./library-summary.types";

/** A project's libraries as the project home shows them. */
export interface ProjectLibraryDocs {
  /** The project's hub; `null` until it is open. */
  hub: LibraryHub | null;
  /** The libraries that could be read, in the project's order. */
  summaries: LibrarySummary[];
  /** Whether the hub is still opening. */
  loading: boolean;
  /** Reads the manifest again after a library was added, renamed or removed. */
  reload: () => Promise<void>;
}
