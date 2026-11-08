/** Whether two axis, mode or collection names are the same (case and outer spaces aside). */
export function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** `name`, or `name 2`, `name 3`… until it isn't in `taken`. */
export function freeName(name: string, taken: ReadonlySet<string>): string {
  if (!taken.has(name)) return name;
  for (let n = 2; ; n++) {
    const candidate = `${name} ${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** The name a file's record gets when it's kept beside the library's: `"<name> (<file name>)"`. */
export function keptName(name: string, fileName: string, taken: ReadonlySet<string>): string {
  return freeName(`${name} (${fileName})`, taken);
}
