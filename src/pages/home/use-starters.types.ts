import type { FileType } from "@shared/core";

/** A starter as Home lists it: what it shows, and which product opens it. */
export interface HomeStarter {
  id: string;
  label: string;
  description: string;
  preview: string;
  type: FileType;
}
