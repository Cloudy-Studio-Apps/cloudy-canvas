import { CloudCheck, CloudUpload } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { useCanvasFile } from "./canvas-file-context";
import { t } from "./file.i18n";

/**
 * Beside the file's name: a cloud while the file is being saved and, for a few seconds after,
 * a checked cloud that fades out. The unsaved dot shows only when autosave won't save the changes.
 */
export function SaveIndicator() {
  const { dirty, status, saved, autosave, draft } = useCanvasFile();

  if (dirty && (!autosave || status === "error")) {
    return (
      <span
        className="text-muted-foreground"
        title={t("save.unsaved")}
        aria-label={t("save.unsaved")}
      >
        •
      </span>
    );
  }

  const saving = status === "saving";
  const label = saving
    ? t("save.saving")
    : draft
      ? t("save.draft")
      : saved === "auto"
        ? t("save.autosaved")
        : t("save.saved");
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
