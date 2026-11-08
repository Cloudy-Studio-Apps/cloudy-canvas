import { MoreHorizontal, Pin } from "lucide-react";

import { relativeTime } from "@shared/core";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui/kit";
import {
  LibraryStrip,
  ProjectIcon,
  useProjectFileCount,
  useProjectLibraryColors,
} from "@pages/shared/projects";
import type { ProjectCardProps } from "./project-card.types";
import { t } from "../projects.i18n";

/** A project on the Projects page: its mark, name, size and when it was opened. */
export function ProjectCard({
  project,
  missing,
  onOpen,
  onLocate,
  onForget,
  onTogglePin,
}: ProjectCardProps) {
  const count = useProjectFileCount(project.root, !missing);
  const colors = useProjectLibraryColors(project.root, project.id, !missing);
  const when = relativeTime(project.openedAt) ?? t("card.justNow");

  return (
    <div
      className={cn(
        "group/row relative flex flex-col gap-3 rounded-card border bg-surface p-3.5 shadow-soft",
        "transition-[box-shadow,border-color] duration-200",
        missing ? "border-dashed" : "hover:border-border-strong hover:shadow-lifted",
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the whole card header opens the project */}
        <button
          type="button"
          disabled={missing}
          aria-label={t("card.openLabel", { name: project.name })}
          onClick={() => onOpen(project)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md text-left outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-[3px] focus-visible:after:ring-ring/40 disabled:cursor-default"
        >
          <ProjectIcon
            name={project.name}
            color={project.color}
            className={cn(missing && "opacity-50")}
          />
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-sm font-semibold",
                missing && "text-muted-foreground",
              )}
            >
              {project.name}
            </span>
            <span
              className={cn(
                "block truncate text-xs",
                missing ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {missing
                ? t("card.missing")
                : [
                    count !== null ? t("card.files", { count }) : null,
                    t("card.edited", { time: when }),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
            </span>
          </span>
        </button>
        {!missing && (
          <div className="relative flex items-center gap-0.5">
            <IconButton
              label={t(project.pinned ? "card.unpin" : "card.pin", { name: project.name })}
              size="xs"
              active={project.pinned}
              revealOnHover={!project.pinned}
              onClick={() => onTogglePin(project)}
            >
              <Pin />
            </IconButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  label={t("card.more", { name: project.name })}
                  size="xs"
                  revealOnHover
                  tooltip={false}
                >
                  <MoreHorizontal />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onForget(project)}>
                  {t("card.forget")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {!missing && (
        <LibraryStrip
          colors={colors.length > 0 ? colors : [project.color]}
          className="h-2 rounded-sm"
        />
      )}
      {missing && (
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onLocate(project)}>
            {t("card.locate")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onForget(project)}>
            {t("card.forget")}
          </Button>
        </div>
      )}
    </div>
  );
}
