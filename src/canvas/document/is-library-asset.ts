import type { LibraryAsset } from "./library-asset.types";

/** Whether a stored value is a picture's record (`LibraryAsset`), in a file or a library. */
export function isLibraryAsset(value: unknown): value is LibraryAsset {
  if (typeof value !== "object" || value === null) return false;
  const asset = value as Partial<LibraryAsset>;
  return (
    typeof asset.id === "string" &&
    typeof asset.name === "string" &&
    typeof asset.group === "string" &&
    typeof asset.hash === "string" &&
    typeof asset.ext === "string" &&
    typeof asset.order === "string"
  );
}
