import type { ImageFailure, ImageFailureReason } from "../../update";
import { t } from "../../data.i18n";

/** Reasons in the order they are listed (past the limit is the line's own text). */
const ORDER = [
  "unreadable",
  "notImage",
  "tooLarge",
] as const satisfies readonly ImageFailureReason[];

/** Why pictures weren't saved, in words with their counts: "2 over 25 MB · 1 isn't a picture". */
export function failureReasons(failed: readonly ImageFailure[]): string {
  const counts = new Map<ImageFailureReason, number>();
  for (const failure of failed) counts.set(failure.reason, (counts.get(failure.reason) ?? 0) + 1);
  return ORDER.flatMap((reason: (typeof ORDER)[number]) => {
    const count = counts.get(reason) ?? 0;
    return count > 0 ? [t(`images.reason.${reason}`, { count })] : [];
  }).join(" · ");
}
