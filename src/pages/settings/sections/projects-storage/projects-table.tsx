import { formatSize } from "@shared/core";
import { Button } from "@shared/ui/kit";
import { ProjectIcon } from "@pages/shared/projects";
import type { ProjectsTableProps } from "./projects-storage.types";
import { t } from "../../settings.i18n";

const COLUMNS = "grid-cols-[minmax(0,1fr)_6rem_11rem_7rem]";

/** A row per project: its size, what its trash holds and Empty trash. */
export function ProjectsTable({ projects, sizes, onEmpty }: ProjectsTableProps) {
  return (
    <div className="rounded-card border">
      <div
        className={`grid ${COLUMNS} gap-3 border-b px-3 py-2 text-xs font-medium text-muted-foreground`}
      >
        <span>{t("storage.project")}</span>
        <span>{t("storage.size")}</span>
        <span>{t("storage.inTrash")}</span>
        <span />
      </div>
      {projects.map((project) => {
        const measured = sizes.get(project.id);
        return (
          <div
            key={project.id}
            className={`grid ${COLUMNS} items-center gap-3 border-b px-3 py-2 text-sm last:border-0`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <ProjectIcon name={project.name} color={project.color} size="sm" />
              <span className="truncate">{project.name}</span>
            </span>
            <span className="tabular-nums">{measured ? formatSize(measured.total) : "…"}</span>
            <span className="text-muted-foreground">
              {!measured
                ? "…"
                : measured.trashItems === 0
                  ? t("storage.trashEmpty")
                  : t("storage.trashItems", {
                      count: measured.trashItems,
                      size: formatSize(measured.trash),
                    })}
            </span>
            {measured && measured.trashItems > 0 ? (
              <Button variant="outline" size="sm" onClick={() => onEmpty(project)}>
                {t("storage.emptyTrash")}
              </Button>
            ) : (
              <span />
            )}
          </div>
        );
      })}
    </div>
  );
}
