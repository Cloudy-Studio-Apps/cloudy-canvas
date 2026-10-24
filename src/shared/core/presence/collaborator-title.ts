import type { Collaborator } from "./presence.types";

/** A collaborator's name for people: another person's agent says whose it is. */
export function collaboratorTitle(collaborator: Collaborator): string {
  const { name, owner } = collaborator;
  return owner ? `${name} · ${owner.name}` : name;
}
