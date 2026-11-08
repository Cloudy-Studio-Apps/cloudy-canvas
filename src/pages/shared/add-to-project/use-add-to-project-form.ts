import { useMemo, useState } from "react";

import type { ClashChoice } from "@canvas";
import { useProjectsStore } from "@shared/stores/projects-store";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { folderOfFile, projectLabel } from "@pages/shared/files";
import type { AddToProjectForm, AddToProjectFormOptions } from "./add-to-project-dialog.types";
import { useMergeSession } from "./use-merge-session";
import { useProjectFolders } from "./use-project-folders";
import { t } from "./add-to-project.i18n";

/** The Add to project dialog's choices: project, folder, library and each clash's choice. */
export function useAddToProjectForm({
  file,
  project: fixed,
  folder: initialFolder,
  onClose,
  onAdded,
}: AddToProjectFormOptions): AddToProjectForm {
  const all = useProjectsStore((state) => state.projects);
  const missing = useProjectsStore((state) => state.missing);
  const projects = useMemo(
    () => (fixed ? [fixed] : all.filter((p) => !missing.has(p.id))),
    [fixed, all, missing],
  );
  const [projectId, setProjectId] = useState<string | null>(fixed?.id ?? null);
  const project = projects.find((p) => p.id === projectId) ?? projects[0] ?? null;
  const [folderChoice, setFolderChoice] = useState<string | null>(null);
  const [libraryChoice, setLibraryChoice] = useState<string | null>(null);
  const [choices, setChoices] = useState<Record<string, ClashChoice>>({});
  const [busy, setBusy] = useState(false);

  const folders = useProjectFolders(project?.root ?? null);
  // A file in the project's folder already stays where it is unless another folder is picked.
  const folder =
    folderChoice ?? initialFolder ?? (project ? (folderOfFile(project.root, file.path) ?? "") : "");
  const session = useMergeSession(file, project);
  const libraries = session.session?.libraries() ?? [];
  const libraryId = libraries.find((l) => l.id === libraryChoice)?.id ?? libraries[0]?.id ?? null;
  const basePlan = useMemo(
    () => (session.session && libraryId ? session.session.plan(libraryId) : null),
    [session.session, libraryId],
  );
  const plan = useMemo(
    () =>
      basePlan && {
        ...basePlan,
        clashes: basePlan.clashes.map((c) => ({ ...c, choice: choices[c.fileId] ?? c.choice })),
      },
    [basePlan, choices],
  );
  const linked = session.session?.linkedProject() != null;

  const add = async () => {
    const opened = session.session;
    if (!opened || !project || linked || busy) return;
    setBusy(true);
    try {
      const saved = await opened.commit({ folder, libraryId, plan });
      await useRecentFilesStore.getState().refresh();
      toast({ title: t("done", { place: projectLabel(saved, [project]) ?? project.name }) });
      onAdded?.(saved, project);
    } catch (error) {
      notifyError(t("failed.add"), error);
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return {
    projects,
    project,
    pickProject: (id) => {
      setProjectId(id);
      setFolderChoice(null);
      setLibraryChoice(null);
      setChoices({});
    },
    folders,
    folder,
    setFolder: setFolderChoice,
    libraries,
    libraryId,
    setLibraryId: (id) => {
      setLibraryChoice(id);
      setChoices({});
    },
    session,
    plan,
    choose: (fileId, choice) => setChoices((prev) => ({ ...prev, [fileId]: choice })),
    linked,
    busy,
    canAdd: session.status === "ready" && project !== null && !linked && !busy,
    add,
  };
}
