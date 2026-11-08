import { Folder } from "lucide-react";

import { cn } from "@shared/ui/kit";
import type { FolderGlyphProps } from "./folder-glyph.types";

/** A filled folder icon in the folder's own color (the muted text color when it has none). */
export function FolderGlyph({ color, className }: FolderGlyphProps) {
  return (
    <Folder
      aria-hidden
      className={cn("shrink-0 text-muted-foreground", className)}
      style={color ? { color, fill: color } : { fill: "currentColor", fillOpacity: 0.25 }}
    />
  );
}
