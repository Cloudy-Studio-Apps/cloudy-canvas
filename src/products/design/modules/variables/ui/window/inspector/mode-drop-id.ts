const PREFIX = "axis:";

/** The drop target id of a mode group (a mode's is its own id). */
export function axisDropId(axisId: string): string {
  return `${PREFIX}${axisId}`;
}

/** The mode group a drop target id names, or `null` when it's a mode. */
export function axisIdOf(dropId: string): string | null {
  return dropId.startsWith(PREFIX) ? dropId.slice(PREFIX.length) : null;
}
