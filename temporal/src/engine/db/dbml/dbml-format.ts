const PLAIN_NAME = /^[\p{L}_][\p{L}\p{N}_]*$/u;
const PLAIN_TYPE = /^[A-Za-z_][A-Za-z0-9_.]*(\([^()]*\))?(\[\])?$/;

/** A table or column name, double-quoted when it isn't a plain identifier. */
export function formatName(name: string): string {
  return PLAIN_NAME.test(name) ? name : `"${name.replace(/(["\\])/g, "\\$1")}"`;
}

export function formatType(type: string): string {
  return PLAIN_TYPE.test(type) ? type : `"${type.replace(/(["\\])/g, "\\$1")}"`;
}

/** A note string: single-quoted, or ''' for multi-line text. */
export function formatString(text: string): string {
  // ''' strings have no escapes, so a literal ''' inside one is shortened.
  if (text.includes("\n")) return `'''${text.replace(/'''/g, "''")}'''`;
  return `'${text.replace(/(['\\])/g, "\\$1")}'`;
}
