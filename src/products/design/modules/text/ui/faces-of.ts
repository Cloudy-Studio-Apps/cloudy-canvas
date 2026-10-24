import { sortVariants, type FontFamily, type FontVariant } from "@shared/core";

/** Faces offered for a family the library doesn't know (e.g. a file from another computer). */
const ANY_FACES: FontVariant[] = sortVariants(
  (["400", "700"] as const).flatMap((weight) => [
    { weight, style: "normal" as const },
    { weight, style: "italic" as const },
  ]),
);

/** The faces a family has, common ones when the library doesn't know it, none without one. */
export function facesOf(
  families: readonly FontFamily[] | null | undefined,
  family: string | null,
): readonly FontVariant[] {
  return families?.find((item) => item.family === family)?.variants ?? (family ? ANY_FACES : []);
}
