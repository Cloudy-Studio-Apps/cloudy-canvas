import { PenTool, StickyNote } from "lucide-react";

import type { FileType } from "@core";
import { cn } from "@ui/lib/utils";
import type { FileTypeIconProps, FileTypeStyle } from "./file-type-icon.types";

const STYLES: Record<FileType, FileTypeStyle> = {
  board: { icon: StickyNote, className: "bg-board-soft text-board-foreground" },
  design: { icon: PenTool, className: "bg-design-soft text-design-foreground" },
};

/** Accent-tinted icon chip for a file type. */
export function FileTypeIcon({ type, size = "md", className }: FileTypeIconProps) {
  const { icon: Icon, className: tint } = STYLES[type];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        size === "sm" && "size-7 rounded-md [&_svg]:size-4",
        size === "md" && "size-9 rounded-md [&_svg]:size-5",
        size === "lg" && "size-11 rounded-lg [&_svg]:size-6",
        tint,
        className,
      )}
    >
      <Icon strokeWidth={2} />
    </span>
  );
}
