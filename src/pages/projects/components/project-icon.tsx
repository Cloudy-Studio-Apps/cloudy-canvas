import { cn } from "@shared/ui/kit";
import { projectInitials } from "../project-initials";
import type { ProjectIconProps } from "./project-icon.types";

/** A project's mark: its initials on its color. */
export function ProjectIcon({ name, color, size = "md", className }: ProjectIconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold tracking-wide",
        size === "sm" ? "size-6 text-[10px]" : "size-9 text-xs",
        className,
      )}
      // The color is the project's own, so the text on it is white whatever the theme.
      style={{ background: color, color: "#fff" }}
    >
      {projectInitials(name)}
    </span>
  );
}
