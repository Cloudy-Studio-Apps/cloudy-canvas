import type { ShareGuestState } from "@canvas";
import { toast } from "@shared/stores/toast-store";
import { END_TITLES } from "./end-titles";

/** Says why the session ended, unless the user left it. */
export function toastSessionEnd(end: NonNullable<ShareGuestState["end"]>): void {
  if (end.reason === "left") return;
  toast({
    title: END_TITLES[end.reason],
    description: end.message,
    ...(end.reason === "ended" ? {} : { tone: "error" as const }),
  });
}
