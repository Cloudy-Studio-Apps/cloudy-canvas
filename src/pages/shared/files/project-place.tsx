import { Briefcase } from "lucide-react";

import { cn } from "@shared/ui/kit";
import type { ProjectPlaceProps } from "./project-place.types";
import { useProjectLabel } from "./use-project-label";

/** "Project › folder" with a briefcase, for a file in a project; nothing for any other file. */
export function ProjectPlace({ file, className }: ProjectPlaceProps) {
  const label = useProjectLabel(file);
  if (!label) return null;
  return (
    <p
      className={cn("flex min-w-0 items-center gap-1 text-xs text-muted-foreground", className)}
      title={label}
    >
      <Briefcase className="size-3 shrink-0" />
      <span className="truncate">{label}</span>
    </p>
  );
}
