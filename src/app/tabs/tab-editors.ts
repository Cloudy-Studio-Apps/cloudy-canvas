import type { TabEditor } from "@canvas-ui/tabs";
import type { FileType } from "@shared/core";
import { lazyComponent } from "../lazy-page";

/** Each product's editor for `TabHost`, loaded with the product (the preload usually has it). */
export const TAB_EDITORS: Record<FileType, TabEditor> = {
  board: lazyComponent(() => import("@board/ui").then((ui) => ui.BoardEditor)),
  design: lazyComponent(() => import("@design/ui").then((ui) => ui.DesignEditor)),
};
