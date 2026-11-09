import { Image, Palette, PenTool, Puzzle, Sparkles, Type } from "lucide-react";

import type { LibraryKind, LibraryKindInfo } from "./library-kinds.types";

/** The kinds in the order the sidebar and a library's page show them. */
export const LIBRARY_KINDS: readonly LibraryKindInfo[] = [
  { kind: "colors", icon: Palette },
  { kind: "text", icon: Type },
  { kind: "images", icon: Image },
  { kind: "svg", icon: PenTool },
  { kind: "components", icon: Puzzle },
  { kind: "effects", icon: Sparkles },
];

/** `value` as a kind (a `?kind=` parameter), or `null`. */
export function asLibraryKind(value: string | null): LibraryKind | null {
  return LIBRARY_KINDS.find((info) => info.kind === value)?.kind ?? null;
}
