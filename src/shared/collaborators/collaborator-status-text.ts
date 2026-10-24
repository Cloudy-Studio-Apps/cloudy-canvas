import type { Collaborator } from "@shared/core";
import { collaboratorIsIdle } from "@shared/stores/collaborators-store";

function ago(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  return minutes < 1 ? "just now" : `${minutes} min ago`;
}

/** What a collaborator is doing for people: its running action, else its last one and when. */
export function collaboratorStatusText(collaborator: Collaborator, now: number): string {
  const { activity } = collaborator.state;
  if (!activity) return collaboratorIsIdle(collaborator, now) ? "Connected, idle" : "Connected";
  if (activity.status === "running") return activity.label;
  const result = activity.status === "error" ? `${activity.label} (failed)` : activity.label;
  return `${result} · ${ago(now - collaborator.lastSeen)}`;
}

/** Where a collaborator works, when it says ("on Page 2"), else `null`. */
export function collaboratorPlaceText(collaborator: Collaborator): string | null {
  const { scopeLabel } = collaborator.state;
  return scopeLabel ? `on ${scopeLabel}` : null;
}
