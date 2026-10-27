import { cn } from "@shared/ui/lib/utils";
import { KIND_TINT } from "../file-kind";
import { useFileThumbnail } from "../use-file-thumbnail";
import { FileKindIcon } from "./file-kind-icon";
import type { FilePreviewProps } from "./file-preview.types";

/** A file's preview picture on its kind's tint, or its icon when it has none. */
export function FilePreview({ file, kind, missing, iconSize = "lg", className }: FilePreviewProps) {
  const thumbnail = useFileThumbnail(file.id);
  const showThumbnail = thumbnail !== null && !missing;

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden",
        missing ? "bg-surface-sunken" : KIND_TINT[kind],
        className,
      )}
    >
      {showThumbnail ? (
        <img src={thumbnail} alt="" draggable={false} className="size-full object-cover" />
      ) : (
        iconSize && (
          <FileKindIcon
            kind={kind}
            size={iconSize}
            className={cn("bg-surface/70", missing && "opacity-40 grayscale")}
          />
        )
      )}
    </div>
  );
}
