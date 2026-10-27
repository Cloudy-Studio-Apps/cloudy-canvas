import type { FileType } from "@shared/core";

export interface CreateTilesProps {
  /** Creates a file of this type, in this mode when given (`?mode=`). */
  onCreate: (type: FileType, mode?: string) => void;
  /** The welcome's longer hints, which say more of what each one does. */
  detailed?: boolean;
}
