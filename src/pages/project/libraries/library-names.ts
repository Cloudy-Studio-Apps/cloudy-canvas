import { isReservedName, type LibraryEntry } from "@shared/core";

/** Why `name` can't name a library, or `null`: `"invalid"`, or `"taken"` by another library. */
export function libraryNameProblem(
  name: string,
  libraries: readonly LibraryEntry[],
  ownId?: string,
): "invalid" | "taken" | null {
  const label = name.trim();
  if (label === "") return null;
  if (isReservedName(label)) return "invalid";
  const taken = libraries.some(
    (library) => library.id !== ownId && library.name.toLowerCase() === label.toLowerCase(),
  );
  return taken ? "taken" : null;
}
