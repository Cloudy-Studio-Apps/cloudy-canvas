import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { useCanvasFile, useProjectLibrariesState } from "@canvas-ui";
import { parentFolder, relativeTo } from "@shared/core";
import { t } from "../../design-ui.i18n";

/**
 * Above the file's name, for a file of a project that was found: "Project › folder", a link to
 * the folder holding the file in the project's home. Loose files show nothing.
 */
export function ProjectCrumb() {
  const { project } = useProjectLibrariesState();
  const { path } = useCanvasFile();
  if (!project) return null;
  const folder = path ? folderIn(project.root, path) : "";
  const name = folder.slice(folder.lastIndexOf("/") + 1);
  const to = `/project/${encodeURIComponent(project.id)}${
    folder ? `?folder=${encodeURIComponent(folder)}` : ""
  }`;
  return (
    <Link
      to={to}
      title={t("leftPanel.openProject", { project: project.name })}
      className="mb-0.5 flex min-w-0 items-center gap-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground"
    >
      <span
        className="size-2.5 shrink-0 rounded-[2px]"
        // The project's own color (data, not chrome).
        style={{ background: project.color }}
      />
      <span className="truncate">{project.name}</span>
      {folder && (
        <>
          <ChevronRight className="size-3 shrink-0" />
          <span className="truncate">{name}</span>
        </>
      )}
    </Link>
  );
}

/** The folder holding `path` inside the project at `root` (`""`: its root, or not inside it). */
function folderIn(root: string, path: string): string {
  try {
    return relativeTo(root, parentFolder(path));
  } catch {
    return "";
  }
}
