/**
 * The messages a shape is refused with that the Data tab knows and translates (engine messages
 * stay English; `ui/data-tab/error-text.ts` reads them back with `readShapeError`).
 */
export const SHAPE_ERRORS = {
  unreadable: "This source's data isn't on this device yet: update it before changing its shape.",
  changed: "The source changed while its shape was applied: try again.",
} as const;

/** Two fields at one path. */
export function collisionMessage(name: string, a: string, b: string): string {
  return `Two fields would both be called "${name}": "${a}" and "${b}".`;
}

/** A field named like another's group. */
export function groupMessage(name: string, path: string, inside: string): string {
  return `"${path}" can't be called "${name}": "${inside}" is inside it.`;
}

/** The name a `collisionMessage` or `groupMessage` is about, `null` for any other message. */
export function readShapeError(
  message: string,
): { kind: "collision" | "group"; name: string } | null {
  const collision = /^Two fields would both be called "(.*)": ".*" and ".*"\.$/.exec(message);
  if (collision) return { kind: "collision", name: collision[1] ?? "" };
  const group = /^".*" can't be called "(.*)": ".*" is inside it\.$/.exec(message);
  return group ? { kind: "group", name: group[1] ?? "" } : null;
}
