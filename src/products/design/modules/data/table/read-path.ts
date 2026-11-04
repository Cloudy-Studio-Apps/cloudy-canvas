import type { PathStep } from "./read-path.types";

const bad = (path: string): Error => new Error(`Bad path: ${path}`);

/** Reads `a.b`, `a[0].b`, `a.0.b` and quoted keys such as `a["x.y"]` into steps. */
export function parsePath(path: string): PathStep[] {
  const steps: PathStep[] = [];
  let i = 0;
  const n = path.length;
  while (i < n) {
    const c = path[i];
    if (c === ".") {
      if (i === 0 || i === n - 1 || path[i - 1] === "." || path[i + 1] === "[") throw bad(path);
      i++;
    } else if (c === "[") {
      if (path[i + 1] === '"') {
        let j = i + 2;
        let raw = "";
        while (j < n && path[j] !== '"') {
          if (path[j] === "\\" && j + 1 < n) j++;
          raw += path[j];
          j++;
        }
        if (path[j] !== '"' || path[j + 1] !== "]") throw bad(path);
        steps.push({ key: raw });
        i = j + 2;
      } else {
        const end = path.indexOf("]", i);
        const inner = end < 0 ? "" : path.slice(i + 1, end);
        if (!/^\d+$/.test(inner)) throw bad(path);
        steps.push({ index: Number(inner) });
        i = end + 1;
      }
    } else {
      let j = i;
      while (j < n && path[j] !== "." && path[j] !== "[") j++;
      const word = path.slice(i, j);
      if (word.includes("]") || word.includes('"')) throw bad(path);
      steps.push(/^\d+$/.test(word) ? { index: Number(word) } : { key: word });
      i = j;
    }
  }
  if (steps.length === 0) throw bad(path);
  return steps;
}

/** The value at a path, or `undefined` when something along it is missing. */
export function readPath(value: unknown, path: string | PathStep[]): unknown {
  const steps = typeof path === "string" ? parsePath(path) : path;
  let cur: unknown = value;
  for (const step of steps) {
    if (cur === null || typeof cur !== "object") return undefined;
    if ("index" in step) {
      cur = Array.isArray(cur)
        ? cur[step.index]
        : (cur as Record<string, unknown>)[String(step.index)];
    } else {
      if (Array.isArray(cur)) return undefined;
      cur = (cur as Record<string, unknown>)[step.key];
    }
  }
  return cur;
}
