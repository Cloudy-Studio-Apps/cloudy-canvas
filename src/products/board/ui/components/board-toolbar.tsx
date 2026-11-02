import { ModuleToolbar } from "@canvas-ui";
import { LibraryButton } from "@board/modules/library/ui";

/** The tools the board's modules put on the toolbar, then the library. */
export function BoardToolbar() {
  return (
    <ModuleToolbar>
      <LibraryButton />
    </ModuleToolbar>
  );
}
