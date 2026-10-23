const NAME = /^\s*(?:attr\s+)?[^\p{L}_"]*("[^"\n]*"|[\p{L}_][\p{L}\p{N}_]*)/u;

/**
 * The attributes the text's `Entity <name> { … }` block lists (its own lines, not a composite's
 * parts), read line by line so half-typed text works too.
 */
export function entityAttributeNames(text: string, entity: string): string[] {
  const head = new RegExp(
    `^\\s*entity\\s+(?:"${escape(entity)}"|${escape(entity)})(?![\\p{L}\\p{N}_])[^{\\n]*\\{`,
    "imu",
  );
  const match = head.exec(text);
  if (!match) return [];
  const names: string[] = [];
  let depth = 1;
  for (const line of text.slice(match.index + match[0].length).split("\n")) {
    if (depth === 1) {
      const name = NAME.exec(line)?.[1];
      if (name && !line.trimStart().startsWith("}")) {
        names.push(name.startsWith('"') ? name.slice(1, -1) : name);
      }
    }
    for (const char of line) {
      if (char === "{") depth++;
      else if (char === "}") depth--;
      if (depth === 0) return names;
    }
  }
  return names;
}

function escape(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
