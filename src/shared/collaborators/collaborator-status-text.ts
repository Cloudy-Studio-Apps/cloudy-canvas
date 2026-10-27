import type { Collaborator } from "@shared/core";
import { collaboratorIsIdle } from "@shared/stores/collaborators-store";
import { t } from "./collaborators.i18n";

function ago(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  return minutes < 1 ? t("justNow") : t("minAgo", { minutes });
}

/** What a collaborator is doing for people: its running action, else its last one and when. */
export function collaboratorStatusText(collaborator: Collaborator, now: number): string {
  const { activity } = collaborator.state;
  if (!activity) return collaboratorIsIdle(collaborator, now) ? t("idle") : t("connected");
  if (activity.status === "running") return activity.label;
  const result =
    activity.status === "error" ? t("failed", { label: activity.label }) : activity.label;
  return `${result} · ${ago(now - collaborator.lastSeen)}`;
}

/** Where a collaborator works, when it says ("on Page 2"), else `null`. */
export function collaboratorPlaceText(collaborator: Collaborator): string | null {
  const { scopeLabel } = collaborator.state;
  return scopeLabel ? t("on", { place: scopeLabel }) : null;
}
