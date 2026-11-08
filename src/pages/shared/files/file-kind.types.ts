import type { FileType } from "@shared/core";

/** What Home shows a file as: its type, or `catalog` for a design left in Catalog mode. */
export type HomeFileKind = FileType | "catalog";
