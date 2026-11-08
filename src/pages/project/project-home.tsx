import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { DragGhost, useRowDrag } from "@canvas-ui";
import type { ProjectEntry } from "@shared/core";
import { ContentView } from "./libraries/content-view";
import { FilesTab } from "./files/files-tab";
import { LibrariesTab } from "./libraries/libraries-tab";
import { asLibraryKind } from "./libraries/library-kinds";
import { NewLibraryDialog } from "./libraries/new-library-dialog";
import { useLibraryActions } from "./libraries/use-library-actions";
import { useProjectLibraryDocs } from "./libraries/use-project-library-docs";
import { MoveDialog } from "./components/move-dialog";
import { ProjectHeader } from "./components/project-header";
import { ProjectSidebar } from "./components/project-sidebar";
import type { ProjectTab } from "./components/project-tabs.types";
import { useProjectFileCount } from "@pages/shared/projects";
import { ProjectContext, relOfDragId } from "./project-context";
import type { ProjectContextValue, ProjectNav } from "./project-context.types";
import { useProjectActions } from "./project-file-actions";
import { ProjectFooter } from "./project-footer";
import type { ProjectHomeProps } from "./project-home.types";
import { isInside, nameOfRel } from "./project-rel";
import { TrashTab } from "./trash-tab";
import { useProjectRecents } from "./use-project-recents";
import { useProjectTrash } from "./use-project-trash";

/** A ready project: the sidebar, the header with its tabs and the tab's content. */
export function ProjectHome({ project }: ProjectHomeProps) {
  const { record, manifest } = project;
  if (!record || !manifest) return null;
  return <ProjectHomeReady project={project} record={record} manifest={manifest} />;
}

function ProjectHomeReady({
  project,
  record,
  manifest,
}: Pick<ProjectContextValue, "project" | "record" | "manifest">) {
  const [params, setParams] = useSearchParams();
  const [scanRev, setScanRev] = useState(0);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [moving, setMoving] = useState<ProjectEntry | null>(null);
  const [newLibraryOpen, setNewLibraryOpen] = useState(false);
  const folder = params.get("folder") ?? "";
  const tab = tabOf(params.get("tab"));
  const libraryId = params.get("library");
  const kind = asLibraryKind(params.get("kind"));
  const setTab = useCallback(
    (next: ProjectTab) => {
      const keep: Record<string, string> = folder === "" ? {} : { folder };
      setParams(next === "files" ? keep : { ...keep, tab: next }, { replace: true });
    },
    [setParams, folder],
  );
  const nav = useMemo<ProjectNav>(
    () => ({
      openLibrary: (id) =>
        setParams(id === null ? { tab: "libraries" } : { tab: "libraries", library: id }, {
          replace: true,
        }),
      openKind: (next) => setParams({ tab: "content", kind: next }, { replace: true }),
    }),
    [setParams],
  );
  const bump = useCallback(() => setScanRev((n) => n + 1), []);
  const setFolder = useCallback(
    (rel: string) => {
      setParams(rel === "" ? {} : { folder: rel }, { replace: true });
    },
    [setParams],
  );

  const fileCount = useProjectFileCount(record.root, true);
  const { infoFor, recent } = useProjectRecents(record.root);
  const libs = useProjectLibraryDocs(record);
  const libraryActions = useLibraryActions({ record, manifest, project, libs, recent, bump });
  const actions = useProjectActions({
    root: record.root,
    projectId: record.id,
    manifest,
    saveManifest: project.saveManifest,
    folder,
    setFolder,
    bump,
    afterRestore: libraryActions.adoptRestored,
  });
  const trash = useProjectTrash(record.root, scanRev);
  const drag = useRowDrag({
    onDrop: (id, overId) =>
      void actions.move(relOfDragId(id), relOfDragId(overId), id.startsWith("folder:")),
    // Only folders take a drop, and not one of the dragged folder's own.
    canDrop: (id, overId) =>
      overId.startsWith("folder:") &&
      !(id.startsWith("folder:") && isInside(relOfDragId(id), relOfDragId(overId))),
  });

  const value: ProjectContextValue = {
    record,
    manifest,
    project,
    tab,
    setTab,
    libraryId,
    kind,
    nav,
    libs,
    libraryActions,
    newLibraryOpen,
    setNewLibraryOpen,
    fileCount,
    folder,
    setFolder,
    scanRev,
    bump,
    renaming,
    setRenaming,
    moving,
    setMoving,
    drag,
    actions,
    infoFor,
    recent,
    trash,
  };

  return (
    <ProjectContext.Provider value={value}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">
          <ProjectSidebar />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <ProjectHeader />
            {tab === "files" && <FilesTab />}
            {tab === "libraries" && <LibrariesTab />}
            {tab === "content" && <ContentView />}
            {tab === "trash" && <TrashTab />}
          </main>
        </div>
        <ProjectFooter onOpenTrash={() => setTab("trash")} />
      </div>
      <MoveDialog />
      <NewLibraryDialog open={newLibraryOpen} onOpenChange={setNewLibraryOpen} />
      {drag.drag && (
        <DragGhost
          label={nameOfRel(relOfDragId(drag.drag.id))}
          pointer={drag.drag.pointer}
          muted={drag.drag.overId === null}
        />
      )}
    </ProjectContext.Provider>
  );
}

/** The tab a `?tab=` parameter names; Files for none or an unknown one. */
function tabOf(value: string | null): ProjectTab {
  return value === "libraries" || value === "content" || value === "trash" ? value : "files";
}
