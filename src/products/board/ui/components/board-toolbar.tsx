import { ModuleToolbar, PanelDivider } from "@canvas-ui";
import { LibraryButton } from "./library";

/** The tools the board's modules put on the toolbar, then the library. */
export function BoardToolbar() {
  return (
    <ModuleToolbar>
      <PanelDivider />
      <LibraryButton />
    </ModuleToolbar>
  );
}
