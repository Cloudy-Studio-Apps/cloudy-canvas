import type { DesignEngine } from "../../../../design-engine.types";
import type { PageSplitContext, PageSplitStep } from "../pages.points.types";

/** What `splitPage` needs: the editor, the page, the contributed steps and where the file goes. */
export interface SplitPageInput {
  engine: DesignEngine;
  pageId: string;
  steps: readonly PageSplitStep[];
  /** The design is in a project whose libraries are open. */
  inProject: boolean;
  /** The folder to write into without asking; `null` asks with the Save dialog. */
  folder: string | null;
  dialog: PageSplitContext["dialog"];
}
