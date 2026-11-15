import { useCallback } from "react";
import { useNavigate } from "react-router";

import { useCanvasFile, useEditorModules, useProjectLibrariesState } from "@canvas-ui";
import { parentFolder } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { pageSplitSteps } from "../pages.points";
import { showSplitDialog } from "./split-dialog-store";
import { splitPage } from "./split-page";
import { t } from "../../pages.i18n";

/**
 * Split into new file: moves a page into its own design, next to this file in a project (else where
 * the Save dialog says), and opens it in a tab.
 */
export function usePageSplit(): (pageId: string) => void {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const libraries = useProjectLibrariesState();
  const file = useCanvasFile();
  const navigate = useNavigate();

  return useCallback(
    (pageId: string) => {
      const inProject = libraries.status === "ready";
      // A project file never saved yet has no folder: the Save dialog asks instead.
      const folder = inProject && file.path ? parentFolder(file.path) || null : null;
      splitPage({
        engine,
        pageId,
        steps: host.get(pageSplitSteps),
        inProject,
        folder,
        dialog: (render) => showSplitDialog(engine, render),
      }).then(
        (saved) => {
          if (saved) void navigate(`/design/${saved.id}`);
        },
        (error: unknown) => notifyError(t("errors.split"), error),
      );
    },
    [engine, host, libraries.status, file.path, navigate],
  );
}
