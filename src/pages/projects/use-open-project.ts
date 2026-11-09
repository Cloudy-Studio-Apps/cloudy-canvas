import { useCallback } from "react";
import { useNavigate } from "react-router";

import { pickFolder, pickProjectFile } from "@platform";
import { parentFolder, type ProjectRecord } from "@shared/core";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "./projects.i18n";

/** Opening projects: a known one, or one picked as its `.cproject` file or as its folder. */
export function useOpenProject() {
  const navigate = useNavigate();

  const openRoot = useCallback(
    async (root: string) => {
      try {
        const project = await useProjectsStore.getState().open(root);
        await navigate(`/project/${project.id}`);
      } catch (error) {
        notifyError(t("page.readFailed"), error);
      }
    },
    [navigate],
  );

  const openRecord = useCallback((project: ProjectRecord) => openRoot(project.root), [openRoot]);

  const openFile = useCallback(async () => {
    const path = await pickProjectFile(t("open.fileTitle")).catch(() => null);
    if (path) await openRoot(parentFolder(path));
  }, [openRoot]);

  const openFolder = useCallback(async () => {
    const root = await pickFolder(t("open.folderTitle")).catch(() => null);
    if (root) await openRoot(root);
  }, [openRoot]);

  return { openRecord, openFile, openFolder };
}
