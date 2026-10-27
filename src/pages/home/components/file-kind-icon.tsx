import { FileTypeIcon } from "@shared/ui/components/file-type-icon";
import { CATALOG_STYLE } from "../file-kind";
import type { FileKindIconProps } from "./file-kind-icon.types";

/** A file's icon chip: its type's, or the catalog's for a catalog. */
export function FileKindIcon({ kind, size, className }: FileKindIconProps) {
  return kind === "catalog" ? (
    <FileTypeIcon type="design" style={CATALOG_STYLE} size={size} className={className} />
  ) : (
    <FileTypeIcon type={kind} size={size} className={className} />
  );
}
