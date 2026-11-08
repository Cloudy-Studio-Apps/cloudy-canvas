import { Pin } from "lucide-react";

import { revealFile } from "@platform";
import { relativeTime } from "@shared/core";
import { Button, IconButton } from "@shared/ui/kit";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError } from "@shared/stores/toast-store";
import { ProjectIcon, useProjectFileCount, useProjectImage } from "@pages/shared/projects";
import { useProjectContext } from "../project-context";
import { NewMenu } from "./new-menu";
import { ProjectCover } from "./project-cover";
import { ProjectMoreMenu } from "./project-more-menu";
import { ProjectTabs } from "./project-tabs";
import type { ProjectHeaderProps } from "./project-header.types";
import { t } from "../project.i18n";

/** The project's cover, mark, name and facts, its Pin, ⋯ and New buttons, and the tabs. */
export function ProjectHeader({ tab, onTab }: ProjectHeaderProps) {
  const { record, manifest, recent, project } = useProjectContext();
  const count = useProjectFileCount(record.root, true);
  const icon = useProjectImage(record.root, manifest.icon, project.rev);
  const edited = relativeTime(recent[0]?.updatedAt ?? record.openedAt) ?? t("justNow");
  const meta = [
    count !== null ? t("header.files", { count }) : null,
    t("header.libraries", { count: manifest.libraries.length }),
    t("header.edited", { time: edited }),
  ].filter(Boolean);

  return (
    <header className="border-b">
      <ProjectCover />
      <div className="flex items-end gap-4 px-6">
        <ProjectIcon
          name={manifest.name}
          color={manifest.color}
          image={icon}
          size="lg"
          className="-mt-7 size-16 border-4 border-background text-xl"
        />
        <div className="min-w-0 flex-1 pt-3">
          <h1 className="truncate text-xl font-semibold">{manifest.name}</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {meta.map((part) => (
              <span key={part}>{part}</span>
            ))}
            <Button
              variant="link"
              size="sm"
              className="h-auto max-w-80 truncate p-0 font-mono text-xs"
              title={t("header.reveal")}
              onClick={() =>
                void revealFile(record.root).catch((e: unknown) =>
                  notifyError(t("actions.revealFailed"), e),
                )
              }
            >
              {record.root}
            </Button>
          </p>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <IconButton
            label={t(record.pinned ? "header.unpin" : "header.pin")}
            variant="outline"
            size="md"
            active={record.pinned}
            onClick={() => void useProjectsStore.getState().setPinned(record.id, !record.pinned)}
          >
            <Pin />
          </IconButton>
          <ProjectMoreMenu />
          <NewMenu />
        </div>
      </div>
      <div className="px-6 pt-2 pb-2">
        <ProjectTabs value={tab} onChange={onTab} />
      </div>
    </header>
  );
}
