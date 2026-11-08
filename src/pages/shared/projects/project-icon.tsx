import { cn } from "@shared/ui/kit";
import { readableTextOn } from "@shared/ui/lib/readable-text";
import { projectInitials } from "./project-initials";
import type { ProjectIconProps } from "./project-icon.types";

/** A project's mark: its picture, or its initials on its color. */
export function ProjectIcon({ name, color, image, size = "md", className }: ProjectIconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold tracking-wide",
        size === "sm" ? "size-6 text-[10px]" : size === "lg" ? "size-14 text-lg" : "size-9 text-xs",
        className,
      )}
      // The color is the project's own, so the text on it follows it, whatever the theme.
      style={{ background: color, color: readableTextOn(color) }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          draggable={false}
          className="size-full rounded-[inherit] object-cover"
        />
      ) : (
        projectInitials(name)
      )}
    </span>
  );
}
