import type { FileType } from "@shared/core";

/** The file a `/<type>/<id>` route opens. */
export interface FileRoute {
  type: FileType;
  id: string;
}
