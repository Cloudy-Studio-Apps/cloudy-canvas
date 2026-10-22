import type { FileInfo } from "@shared/core";

/** How one kind of Figma file is imported, and what's said when it can't be. */
export interface FigmaImporter {
  run: (path: string) => Promise<FileInfo>;
  failed: string;
}
