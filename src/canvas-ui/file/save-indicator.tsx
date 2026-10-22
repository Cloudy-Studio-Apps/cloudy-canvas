import { CloudCheck, CloudUpload } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { useCanvasFile } from "./canvas-file-context";

/**
 * Beside the file's name: a cloud while the file is being saved and, for a few seconds after,
 * a checked cloud that fades out. The unsaved dot shows only when autosave won't save the changes.
 */
export function SaveIndicator() {
  const { dirty, status, saved, autosave, draft } = useCanvasFile();

  if (dirty && (!autosave || status === "error")) {
    return (
      <span className="text-muted-foreground" title="Unsaved changes" aria-label="Unsaved changes">
        •
      </span>
    );
  }

  const saving = status === "saving";
  const label = saving
    ? "Saving…"
    : draft
      ? "Draft autosaved. Save to choose where it goes"
      : saved === "auto"
        ? "Autosaved"
        : "Saved";
  const visible = saving || saved !== null;
  const Icon = saving ? CloudUpload : CloudCheck;

  return (
    <span
      role="status"
      title={visible ? label : undefined}
      aria-label={visible ? label : undefined}
      className={cn(
        "flex text-muted-foreground transition-opacity duration-500 motion-reduce:transition-none [&>svg]:size-4",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon aria-hidden />
    </span>
  );
}
