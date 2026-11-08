import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import { DragGhost, useRowDrag } from "@canvas-ui";
import type { ProjectEntry } from "@shared/core";
import { FilesTab } from "./files/files-tab";
import { MoveDialog } from "./components/move-dialog";
import { PlaceholderTab } from "./components/placeholder-tab";
import { ProjectHeader } from "./components/project-header";
import { ProjectSidebar } from "./components/project-sidebar";
import type { ProjectTab } from "./components/project-tabs.types";
import { ProjectContext, relOfDragId } from "./project-context";
import type { ProjectContextValue } from "./project-context.types";
import { useProjectActions } from "./project-file-actions";
import type { ProjectHomeProps } from "./project-home.types";
import { isInside, nameOfRel } from "./project-rel";
import { useProjectRecents } from "./use-project-recents";
import { t } from "./project.i18n";

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
  const [tab, setTab] = useState<ProjectTab>("files");
  const [scanRev, setScanRev] = useState(0);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [moving, setMoving] = useState<ProjectEntry | null>(null);
  const folder = params.get("folder") ?? "";
  const bump = useCallback(() => setScanRev((n) => n + 1), []);
  const setFolder = useCallback(
    (rel: string) => {
      setTab("files");
      setParams(rel === "" ? {} : { folder: rel }, { replace: true });
    },
    [setParams],
  );

  const actions = useProjectActions({
    root: record.root,
    projectId: record.id,
    manifest,
    saveManifest: project.saveManifest,
    folder,
    setFolder,
    bump,
  });
  const { infoFor, recent } = useProjectRecents(record.root);
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
  };

  return (
    <ProjectContext.Provider value={value}>
      <div className="flex min-h-0 flex-1">
        <ProjectSidebar tab={tab} onTrash={() => setTab("trash")} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <ProjectHeader tab={tab} onTab={setTab} />
          {tab === "files" && <FilesTab />}
          {tab === "libraries" && (
            <PlaceholderTab
              title={t("soon.librariesTitle")}
              description={t("soon.librariesText")}
            />
          )}
          {tab === "trash" && (
            <PlaceholderTab title={t("soon.trashTitle")} description={t("soon.trashText")} />
          )}
        </main>
      </div>
      <MoveDialog />
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
